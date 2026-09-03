import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { db, getSession, getProgressState, recomputeProgress, allSessions } from "@/lib/db";
import { requestReport, deliveryCoaching, wordOfDayUsed, CoachUnavailableError } from "@/lib/feedback";
import { type EightScores, type Session } from "@/lib/types";
import { computeEight, overallFromEight, xpForScore, levelForXp, WORD_OF_DAY_BONUS, type LevelState } from "@/lib/progression";
import { CONFIDENCE_LABEL_KEY } from "@/lib/metricMeta";
import { PACE_BAND, wpmSeries } from "@/lib/metrics";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { CountUp } from "@/components/CountUp";
import { Meter } from "@/components/Meter";
import { Sparkline } from "@/components/Sparkline";
import { ScoreRing } from "@/components/ScoreRing";
import { CoachListening } from "@/components/CoachListening";
import { ParticleBurst } from "@/components/kokonut/ParticleBurst";
import { MetricRadar } from "@/components/progress/MetricRadar";

/** Pace meter domain: 60–220 wpm covers everything a human plausibly records. */
const PACE_DOMAIN: [number, number] = [60, 220];

type Phase = "loading" | "ready" | "offline" | "missing";

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
  /** The scored session immediately before this one — the radar's dashed ghost. */
  const [previous, setPrevious] = useState<EightScores | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    (async () => {
      const s = await getSession(Number(id));
      if (!s) {
        // Bad deep link or wiped store: without this the skeleton never resolves.
        setPhase("missing");
        return;
      }
      setSession(s);
      const earlier = (await allSessions())
        .filter((o) => o.id !== s.id && o.startedAt < s.startedAt && o.progress?.scores)
        .sort((a, b) => a.startedAt - b.startedAt)
        .pop();
      setPrevious(earlier?.progress?.scores ?? null);
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

  if (phase === "missing") {
    return (
      <div className="pt-2 lg:pt-0">
        <div className="box mt-8 flex flex-col items-center gap-4 p-6 text-center">
          <Icon name="info" size={22} className="text-bad" />
          <p className="text-sm text-muted" style={{ overflowWrap: "break-word" }}>
            {t("sessionMissing")}
          </p>
          <Link to="/" className="text-sm text-accent underline underline-offset-4">
            {t("backToToday")}
          </Link>
        </div>
      </div>
    );
  }

  if (!session) return <FeedbackSkeleton />;

  const { metrics: m, report } = session;
  const eight: EightScores = session.progress?.xpPending === false && session.progress
    ? session.progress.scores
    : computeEight(m, report ?? null);
  const overall = session.progress?.overallScore ?? overallFromEight(eight);
  const offline = phase === "offline" && !report;
  const delivery = deliveryCoaching(m, session.lang);

  /**
   * The coach line per metric, shown under the selected radar axis. Offline we
   * only have the two deterministic ones.
   */
  const oneLiners = report?.oneLiners ?? {
    pace: delivery.pace.improve,
    fluency: delivery.fluency.improve,
  };

  const band = PACE_BAND[session.lang];
  const series = wpmSeries(session.segments, m.durationSec);
  const wpmValues = series.length >= 2 ? series : (report?.wpmOverTime ?? []).map((v) => Math.round(v));
  const cleanSec = m.cleanSpeechSec ?? report?.cleanSpeechSeconds ?? 0;
  const paceFrac = (wpm: number) => (wpm - PACE_DOMAIN[0]) / (PACE_DOMAIN[1] - PACE_DOMAIN[0]);

  // The report is deliberately short: one win, two fixes. Older sessions were
  // stored with more, so they are trimmed here too rather than left long.
  const win = report?.whatWorked?.[0];
  const fixes = report?.improvements?.slice(0, 2) ?? [];

  return (
    <div className="pt-2 lg:pt-0">
      <section className="snap-section">
        <p className="text-sm text-muted">{session.promptTitle}</p>

        {/* ——— Hero: the score in its ring, then the XP moment ——— */}
        <div className="mt-6 flex flex-col items-center text-center">
          {phase === "loading" ? (
            <CoachListening />
          ) : (
            <>
              {overall !== null ? (
                <ScoreRing value={overall} active={fresh || earned !== null} />
              ) : (
                <span className="lectern text-[4rem] leading-none font-semibold text-ink">—</span>
              )}

              {/* XP chips */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {session.progress?.xpPending === false && session.progress.xpEarned > 0 && (
                  <ParticleBurst key={earned ? "burst" : "static"} count={earned ? 14 : 0}>
                    <span className="tnum rounded-full bg-accent/12 px-3.5 py-1 text-sm font-semibold text-accent">
                      {earned ? <CountUp value={earned.xp} prefix="+" suffix=" XP" delay={0.4} /> : `+${session.progress.xpEarned} XP`}
                    </span>
                  </ParticleBurst>
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

          {/* Delivery stats — pace, length and the filler count, always visible */}
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
      </section>

      {/* Failed / timed-out analysis — the 45s ceiling lives in lib/feedback.ts */}
      {offline && (
        <div className="box mt-8 flex flex-col gap-3 p-5">
          <div className="flex items-center gap-2.5">
            <Icon name="clock" size={18} className="shrink-0 text-bad" />
            <p className="text-base font-medium text-ink">{t("coachTimeout")}</p>
          </div>
          <p className="text-sm text-muted" style={{ overflowWrap: "break-word" }}>
            {t("coachFailed")} {t("xpPendingNote")}
          </p>
          <Button variant="gold" onClick={() => fetchReport(session)}>
            <Icon name="refresh" size={16} />
            {t("retryCoach")}
          </Button>
        </div>
      )}

      {/* ——— The eight metrics, as one shape ——— */}
      <section className="snap-section mt-10">
        <h2 className="label-caps">{t("radarTitleFeedback")}</h2>
        {phase === "loading" ? (
          <div className="skeleton mt-4 h-[420px]" />
        ) : (
          <div className="mt-4">
            <MetricRadar
              primary={eight}
              overlay={previous}
              primaryLabel={t("radarLegendCurrent")}
              overlayLabel={t("radarLegendPrev")}
              deltaLabel={t("metricDeltaVs")}
              oneLiners={oneLiners}
            />
          </div>
        )}
        {offline && <p className="mt-3 text-sm text-muted">{t("reconnectNote")}</p>}
      </section>

      {report && phase === "ready" && (
        <>
          {/* One thing that worked */}
          {win && (
            <section className="snap-section mt-6 box p-5">
              <h2 className="label-caps">{t("whatWorked")}</h2>
              <div className="mt-3 flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok">
                  <Icon name="check" size={13} />
                </span>
                <span>
                  <span className="text-base font-medium text-ink">{win.point}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{win.detail}</span>
                </span>
              </div>
            </section>
          )}

          {/* Two things to work on */}
          {fixes.length > 0 && (
            <section className="snap-section mt-6 box p-5">
              <h2 className="label-caps">{t("improveTitle")}</h2>
              <ol className="mt-3 flex flex-col gap-3">
                {fixes.map((item, i) => (
                  <li key={item.issue} className="flex items-start gap-3">
                    <span className="tnum shrink-0 text-base font-semibold text-accent-dim">{i + 1}.</span>
                    <span className="text-sm leading-relaxed">
                      <span className="text-ink">{item.issue}</span>{" "}
                      <span className="text-muted">{item.action}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      {/* ——— Everything else, folded away ——— */}
      <details className="disclosure snap-section mt-6 box px-5 py-2" data-testid="more-detail">
        <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 text-sm font-medium text-muted hover:text-ink">
          {t("moreDetail")}
          <Icon name="chevronDown" size={16} className="disclosure-chevron shrink-0" />
        </summary>

        {report && phase === "ready" && (
          <>
            {report.tighten.quote && (
              <div className="mt-5 border-t hairline pt-5">
                <h3 className="label-caps">{t("sayItBetter")}</h3>
                <p className="mt-3 text-sm text-muted">
                  {t("yourVersion")}: <span className="quoted-phrase text-ink/70">“{report.tighten.quote}”</span>
                </p>
                <p className="mt-2 text-sm text-muted">
                  {t("betterVersion")}: <span className="quoted-phrase text-accent">“{report.tighten.rewrite}”</span>
                </p>
              </div>
            )}

            <div className="mt-5 border-t hairline pt-5">
              <h3 className="label-caps">{t("vocalDeliveryTitle")}</h3>
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
                {cleanSec > 0 && <p className="text-sm text-muted">{t("cleanSpeechLabel", { n: cleanSec })}</p>}
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
            </div>

            {eight.confidence !== null && (
              <div className="mt-5 border-t hairline pt-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="label-caps">{t("confidenceTitle")}</h3>
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
              </div>
            )}

            <div className="mt-5 border-t hairline pt-5">
              <div className="flex items-baseline justify-between">
                <h3 className="label-caps">{t("paceSectionTitle")}</h3>
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
            </div>

            {(report.stylisticDevices?.length ?? 0) > 0 && (
              <div className="mt-5 border-t hairline pt-5">
                <h3 className="label-caps">{t("stylisticTitle")}</h3>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {report.stylisticDevices!.slice(0, 2).map((d) => (
                    <li key={d.device} className="flex items-baseline gap-3">
                      <span className="shrink-0 text-base font-medium text-ink">{d.device}</span>
                      <span className="text-sm leading-relaxed text-muted">{d.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="mt-5 border-t hairline pb-3 pt-5">
          <h3 className="label-caps">{t("transcriptTitle")}</h3>
          <p className="lectern mt-3 text-base leading-relaxed text-ink/80">{session.transcript}</p>
        </div>
      </details>

      <div className="snap-end mt-10 flex flex-col gap-3 pb-6">
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
          <Link to="/scenarios" className="text-center text-sm text-muted hover:text-ink underline underline-offset-4">
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
      className="mt-4 flex items-center gap-3 box px-5 py-3"
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
        <div className="skeleton h-52 w-52 rounded-full" />
        <div className="skeleton h-6 w-56" />
      </div>
      <div className="skeleton mt-10 h-[420px]" />
    </div>
  );
}
