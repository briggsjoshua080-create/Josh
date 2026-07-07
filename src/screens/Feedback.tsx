import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { db, getSession, getProgressState, recomputeProgress } from "@/lib/db";
import { requestReport, deliveryCoaching, wordOfDayUsed, CoachUnavailableError } from "@/lib/feedback";
import { METRIC_KEYS, type EightScores, type MetricKey, type Session } from "@/lib/types";
import { computeEight, overallFromEight, xpForScore, levelForXp, WORD_OF_DAY_BONUS, type LevelState } from "@/lib/progression";
import { METRIC_META, CONFIDENCE_LABEL_KEY } from "@/lib/metricMeta";
import { PACE_BAND, wpmSeries } from "@/lib/metrics";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { CountUp } from "@/components/CountUp";
import { Meter } from "@/components/Meter";
import { Sparkline } from "@/components/Sparkline";

function gradeFor(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/** Pace meter domain: 60–220 wpm covers everything a human plausibly records. */
const PACE_DOMAIN: [number, number] = [60, 220];

type Phase = "loading" | "ready" | "offline";

interface Earned {
  xp: number;
  wordBonus: boolean;
  levelUp: LevelState | null;
}

export function Feedback() {
  const { t, lang } = useI18n();
  const { id } = useParams();
  const [params] = useSearchParams();
  const fresh = params.get("fresh") === "1";

  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [earned, setEarned] = useState<Earned | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    (async () => {
      const s = await getSession(Number(id));
      if (!s) return;
      setSession(s);
      if (s.report) setPhase("ready");
      else await fetchReport(s);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchReport(s: Session) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPhase("loading");
    try {
      const report = await requestReport({
        lang: s.lang,
        promptTitle: s.promptTitle,
        promptText: s.promptText,
        transcript: s.transcript,
        durationSec: s.durationSec,
        wordOfDay: s.wordOfDay,
        metrics: s.metrics,
      });

      const scores = computeEight(s.metrics, report);
      const overallScore = overallFromEight(scores)!;
      const wodUsed =
        s.progress?.wordOfDayUsed ?? (s.wordOfDay ? wordOfDayUsed(s.transcript, s.wordOfDay) : false);
      const xpEarned = xpForScore(overallScore) + (wodUsed ? WORD_OF_DAY_BONUS : 0);
      const wasPending = s.progress?.xpPending ?? true;

      const xpBefore = (await getProgressState()).cumulativeXp;
      const progress = {
        scores,
        overallScore,
        xpEarned,
        wordOfDayUsed: wodUsed,
        wpm: s.metrics.wpm,
        xpPending: false,
      };
      await db.sessions.update(s.id!, { report, progress });
      const after = await recomputeProgress();

      if (wasPending) {
        const levelNow = levelForXp(after.cumulativeXp);
        setEarned({
          xp: xpEarned,
          wordBonus: wodUsed,
          levelUp: levelNow.level > levelForXp(xpBefore).level ? levelNow : null,
        });
      }
      setSession({ ...s, report, progress });
      setPhase("ready");
    } catch (err) {
      if (!(err instanceof CoachUnavailableError)) console.error(err);
      setPhase("offline");
    }
    inFlight.current = false;
  }

  if (!session) return <FeedbackSkeleton />;

  const { metrics: m, report } = session;
  const eight: EightScores = session.progress?.xpPending === false && session.progress
    ? session.progress.scores
    : computeEight(m, report ?? null);
  const overall = session.progress?.overallScore ?? overallFromEight(eight);
  const offline = phase === "offline" && !report;
  const delivery = deliveryCoaching(m, session.lang);

  /** The single coach sentence per metric row. */
  const oneLiner = (key: MetricKey): string | undefined => {
    if (report) return report.oneLiners[key] || undefined;
    if (key === "pace") return delivery.pace.improve;
    if (key === "fluency") return delivery.fluency.improve;
    return undefined;
  };

  const band = PACE_BAND[session.lang];
  const series = wpmSeries(session.segments, m.durationSec);
  const wpmValues = series.length >= 2 ? series : (report?.wpmOverTime ?? []).map((v) => Math.round(v));
  const cleanSec = m.cleanSpeechSec ?? report?.cleanSpeechSeconds ?? 0;
  const paceFrac = (wpm: number) => (wpm - PACE_DOMAIN[0]) / (PACE_DOMAIN[1] - PACE_DOMAIN[0]);

  return (
    <div className="pt-2 lg:pt-0">
      <p className="text-sm text-muted">{session.promptTitle}</p>

      {/* ——— Hero: overall score, grade, XP moment ——— */}
      <div className="mt-6 flex flex-col items-center text-center">
        {phase === "loading" ? (
          <>
            <div className="skeleton h-24 w-40" />
            <p className="mt-4 text-sm text-muted">{t("analyzing")}</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-3">
              <span className="lectern tnum text-[4.5rem] leading-none font-semibold text-ink">
                {overall !== null ? <CountUp value={overall} active={fresh || earned !== null} /> : "—"}
              </span>
              {overall !== null && (
                <span className="lectern text-2xl text-accent">{gradeFor(overall)}</span>
              )}
            </div>

            {/* XP chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {session.progress?.xpPending === false && session.progress.xpEarned > 0 && (
                <span className="tnum rounded-full bg-accent/12 px-3.5 py-1 text-sm font-semibold text-accent">
                  {earned ? <CountUp value={earned.xp} prefix="+" suffix=" XP" delay={0.4} /> : `+${session.progress.xpEarned} XP`}
                </span>
              )}
              {session.progress?.wordOfDayUsed && session.progress.xpPending === false && (
                <span className="rounded-full border border-line px-3 py-1 text-xs text-accent-dim">
                  {t("wordBonusChip")}
                </span>
              )}
              {(offline || session.progress?.xpPending !== false) && (
                <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">
                  {t("xpPendingChip")}
                </span>
              )}
            </div>

            {earned?.levelUp && <LevelUpFlourish state={earned.levelUp} lang={lang} title={t("levelUpTitle")} />}
          </>
        )}

        {/* Delivery stats */}
        <div className="tnum mt-6 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-muted">
          <span>
            <b className="font-semibold text-ink">{m.wpm}</b> {t("wpmUnit")}
          </span>
          <span>
            <b className="font-semibold text-ink">{m.wordCount}</b> {t("wordsUnit")}
          </span>
          <span>
            <b className="font-semibold text-ink">
              {Math.floor(m.durationSec / 60)}:{String(m.durationSec % 60).padStart(2, "0")}
            </b>
          </span>
          <span>
            <b className="font-semibold text-ink">{m.fillers.total}</b> {t("fillersDetected")}
          </span>
        </div>
      </div>

      {/* Offline / failed analysis */}
      {offline && (
        <div className="mt-8 flex flex-col gap-3 rounded-(--radius-card) bg-surface p-5">
          <p className="text-sm text-muted">
            {t("coachFailed")} {t("xpPendingNote")}
          </p>
          <Button variant="gold" onClick={() => fetchReport(session)}>
            <Icon name="refresh" size={16} />
            {t("retryCoach")}
          </Button>
        </div>
      )}

      {/* ——— The eight metrics ——— */}
      <section className="mt-10">
        <h2 className="label-caps">{t("metricsSection")}</h2>
        <div className="mt-3 flex flex-col gap-2.5">
          {phase === "loading"
            ? METRIC_KEYS.map((key) => <div key={key} className="skeleton h-[76px]" />)
            : METRIC_KEYS.map((key, i) => (
                <MetricRow
                  key={key}
                  metric={key}
                  label={t(METRIC_META[key].nameKey)}
                  score={eight[key]}
                  sentence={oneLiner(key)}
                  delay={0.05 * i}
                />
              ))}
        </div>
        {offline && <p className="mt-3 text-sm text-muted">{t("reconnectNote")}</p>}
      </section>

      {/* ——— Scroll-down detail ——— */}
      {report && phase === "ready" && (
        <>
          {(report.powerWords.length > 0 || report.weakWords.length > 0) && (
            <section className="mt-10 border-t hairline pt-6">
              {report.powerWords.length > 0 && (
                <>
                  <h2 className="label-caps">{t("powerWordsTitle")}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.powerWords.map((w) => (
                      <WordChip key={w.word} word={w.word} count={w.count} strong />
                    ))}
                  </div>
                </>
              )}
              {report.weakWords.length > 0 && (
                <>
                  <h2 className={`label-caps ${report.powerWords.length > 0 ? "mt-6" : ""}`}>{t("weakWordsTitle")}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {report.weakWords.map((w) => (
                      <WordChip key={w.word} word={w.word} count={w.count} />
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          {report.strongestLine.quote && (
            <section className="mt-10 border-t hairline pt-6">
              <h2 className="label-caps">{t("strongestLineTitle")}</h2>
              <blockquote className="quoted-phrase mt-3 text-lg leading-relaxed text-ink">
                “{report.strongestLine.quote}”
              </blockquote>
              <p className="mt-2 text-sm text-muted">{report.strongestLine.why}</p>
            </section>
          )}

          {report.tighten.quote && (
            <section className="mt-10 border-t hairline pt-6">
              <h2 className="label-caps">{t("tightenTitle")}</h2>
              <p className="mt-3 text-sm text-muted">
                {t("yourVersion")}: <span className="quoted-phrase text-ink/70">“{report.tighten.quote}”</span>
              </p>
              <p className="mt-2 text-sm text-muted">
                {t("tightenRewrite")}: <span className="quoted-phrase text-accent">“{report.tighten.rewrite}”</span>
              </p>
            </section>
          )}

          <section className="mt-10 border-t hairline pt-6">
            <h2 className="label-caps">{t("vocalDeliveryTitle")}</h2>
            {wpmValues.length >= 2 && (
              <div className="mt-4">
                <Sparkline
                  values={wpmValues}
                  band={band}
                  bandLabel={t("easyBandLabel")}
                  unit={t("wpmUnit")}
                  ariaLabel={`${t("vocalDeliveryTitle")}: ${m.wpm} ${t("wpmUnit")}`}
                />
              </div>
            )}
            <div className="mt-5 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted">{t("articulationLabel")}</span>
                <span className="lectern tnum text-lg text-ink">
                  {report.articulation}
                  <span className="text-sm text-faint">/100</span>
                </span>
              </div>
              {cleanSec > 0 && (
                <p className="text-sm text-muted">{t("cleanSpeechLabel", { n: cleanSec })}</p>
              )}
              {report.hardToCatch.length > 0 && (
                <div>
                  <span className="text-sm text-muted">{t("hardToCatchLabel")}</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {report.hardToCatch.map((w) => (
                      <WordChip key={w} word={w} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {eight.confidence !== null && (
            <section className="mt-10 border-t hairline pt-6">
              <div className="flex items-baseline justify-between">
                <h2 className="label-caps">{t("confidenceTitle")}</h2>
                <span className="text-sm font-medium text-accent-dim">
                  {t(CONFIDENCE_LABEL_KEY[report.confidenceLabel] ?? "confLabelSteady")}
                </span>
              </div>
              <div className="mt-4">
                <Meter
                  value={eight.confidence / 100}
                  leftLabel={t("meterTentative")}
                  rightLabel={t("meterCommanding")}
                  ariaLabel={`${t("confidenceTitle")}: ${eight.confidence}/100`}
                />
              </div>
              {report.confidenceNote && <p className="mt-3 text-sm text-muted">{report.confidenceNote}</p>}
            </section>
          )}

          <section className="mt-10 border-t hairline pt-6">
            <div className="flex items-baseline justify-between">
              <h2 className="label-caps">{t("paceSectionTitle")}</h2>
              <span className="tnum text-sm font-medium text-ink">
                {m.wpm} {t("wpmUnit")}
              </span>
            </div>
            <div className="mt-4">
              <Meter
                value={paceFrac(m.wpm)}
                band={[paceFrac(band[0]), paceFrac(band[1])]}
                leftLabel={t("meterSlow")}
                rightLabel={t("meterFast")}
                ariaLabel={`${t("paceSectionTitle")}: ${m.wpm} ${t("wpmUnit")}`}
              />
            </div>
            {report.oneLiners.pace && <p className="mt-3 text-sm text-muted">{report.oneLiners.pace}</p>}
          </section>
        </>
      )}

      {/* Transcript */}
      <details className="mt-10 border-t hairline pt-6">
        <summary className="cursor-pointer text-sm font-medium text-muted hover:text-ink">
          {t("transcriptTitle")}
        </summary>
        <p className="lectern mt-4 text-base leading-relaxed text-ink/80">{session.transcript}</p>
      </details>

      <div className="mt-10 flex flex-col gap-3 pb-6">
        <Link to="/progress">
          <Button variant="gold" className="w-full">
            {t("viewStats")}
            <Icon name="arrowRight" size={16} />
          </Button>
        </Link>
        <Link to="/">
          <Button variant="ghost" className="w-full">
            {t("backToToday")}
          </Button>
        </Link>
        {session.kind === "scenario" && (
          <Link to="/library" className="text-center text-sm text-muted hover:text-ink underline underline-offset-4">
            {t("anotherScenario")}
          </Link>
        )}
      </div>
    </div>
  );
}

function LevelUpFlourish({ state, lang, title }: { state: LevelState; lang: "en" | "de"; title: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="mt-4 flex items-center gap-3 rounded-(--radius-card) border border-accent/40 bg-accent/8 px-5 py-3"
      initial={reduced ? false : { opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 16, delay: 0.9 }}
    >
      <Icon name="sparkle" size={20} className="text-accent" />
      <span className="text-sm text-muted">{title}</span>
      <span className="lectern text-lg text-accent">
        {state.level} — {state.rank.name[lang]}
      </span>
    </motion.div>
  );
}

function MetricRow({
  metric,
  label,
  score,
  sentence,
  delay,
}: {
  metric: MetricKey;
  label: string;
  score: number | null;
  sentence?: string;
  delay: number;
}) {
  const reduced = useReducedMotion();
  const meta = METRIC_META[metric];

  return (
    <div className="rounded-(--radius-card) bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon name={meta.icon} size={17} className="shrink-0 text-muted" />
          <span className="text-base font-medium text-ink">{label}</span>
        </div>
        <span className="tnum whitespace-nowrap text-sm text-faint">
          <b className="lectern text-lg font-semibold text-ink">{score ?? "—"}</b>
          {score !== null && "/100"}
        </span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-surface-2">
        {score !== null && (
          <motion.div
            className="h-full rounded-full"
            style={{ background: meta.tint }}
            initial={reduced ? { width: `${score}%` } : { width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20, delay }}
          />
        )}
      </div>
      {sentence && <p className="mt-2.5 text-sm leading-relaxed text-ink/85">{sentence}</p>}
    </div>
  );
}

function WordChip({ word, count, strong }: { word: string; count?: number; strong?: boolean }) {
  return (
    <span
      className={`rounded-full border border-line px-3 py-1 text-sm ${strong ? "text-accent-dim" : "text-muted"}`}
    >
      {word}
      {count !== undefined && count > 1 && <span className="tnum text-xs text-faint"> ×{count}</span>}
    </span>
  );
}

function FeedbackSkeleton() {
  return (
    <div className="pt-2 lg:pt-0">
      <div className="skeleton h-4 w-40" />
      <div className="mx-auto mt-8 flex flex-col items-center gap-4">
        <div className="skeleton h-24 w-40" />
        <div className="skeleton h-6 w-56" />
      </div>
      <div className="mt-10 flex flex-col gap-2.5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-[76px]" />
        ))}
      </div>
    </div>
  );
}
