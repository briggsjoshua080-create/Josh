import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { db, getSession } from "@/lib/db";
import { requestCoaching, offlineFeedback, deliveryCoaching, categoryFallback, CoachUnavailableError } from "@/lib/feedback";
import { blendScores, type Session } from "@/lib/types";
import { ProgressRing } from "@/components/ProgressRing";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

function gradeFor(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

interface HeadlineRow {
  key: string;
  icon: string;
  label: string;
  score: number | null;
  note?: string;
  improve?: string;
  unmeasured?: boolean;
}

export function Feedback() {
  const { t } = useI18n();
  const { id } = useParams();
  const [params] = useSearchParams();
  const fresh = params.get("fresh") === "1";

  const [session, setSession] = useState<Session | null>(null);
  const [coaching, setCoaching] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    (async () => {
      const s = await getSession(Number(id));
      if (!s) return;
      setSession(s);
      if (!s.ai) await fetchCoaching(s);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchCoaching(s: Session) {
    if (inFlight.current) return;
    inFlight.current = true;
    setCoaching(true);
    let ai;
    try {
      ai = await requestCoaching({
        lang: s.lang,
        promptTitle: s.promptTitle,
        promptText: s.promptText,
        transcript: s.transcript,
        durationSec: s.durationSec,
        wordOfDay: s.wordOfDay,
        metrics: s.metrics,
      });
    } catch (err) {
      if (!(err instanceof CoachUnavailableError)) console.error(err);
      ai = offlineFeedback({ metrics: s.metrics, lang: s.lang, transcript: s.transcript, wordOfDay: s.wordOfDay });
    }
    const scores = blendScores(s.metrics, ai);
    await db.sessions.update(s.id!, { ai, scores });
    setSession({ ...s, ai, scores });
    setCoaching(false);
    inFlight.current = false;
  }

  if (!session) return null;

  const { metrics: m, ai, scores } = session;
  const offline = ai?.source === "offline";
  const delivery = deliveryCoaching(m, session.lang);
  const aiOnline = ai && ai.source !== "offline";

  const headlineRows: HeadlineRow[] = [
    {
      key: "pace",
      icon: "gauge",
      label: t("scorePace"),
      score: scores.pace,
      note: ai?.paceNote || undefined,
      improve: delivery.pace.improve,
    },
    scores.volume !== null
      ? {
          key: "volume",
          icon: "volume",
          label: t("scoreVolume"),
          score: scores.volume,
          note: delivery.volume?.note,
          improve: delivery.volume?.improve,
        }
      : { key: "volume", icon: "volume", label: t("scoreVolume"), score: null, unmeasured: true },
    ...(aiOnline
      ? ([
          ["eloquence", "word", t("scoreEloquence"), ai.eloquence],
          ["structure", "layers", t("scoreStructure"), ai.structure],
          ["stylistic", "sparkle", t("scoreStyle"), ai.stylistic],
          ["comprehensiveness", "target", t("scoreComprehensiveness"), ai.comprehensiveness],
          ["logic", "branch", t("scoreLogic"), ai.logic],
        ] as const).map(([key, icon, label, cat]) => {
          // Backstop: if the coach's response ever comes back with a missing
          // or too-short note/improve, fall back rather than showing a blank card.
          const fallback = cat.note.trim().length < 20 || cat.improve.trim().length < 15
            ? categoryFallback(key, cat.score, session.lang)
            : null;
          return {
            key,
            icon,
            label,
            score: cat.score,
            note: fallback ? fallback.note : cat.note,
            improve: fallback ? fallback.improve : cat.improve,
          };
        })
      : []),
  ];

  return (
    <div className="pt-2 lg:pt-0">
      <p className="text-sm text-muted">{session.promptTitle}</p>

      {/* Score reveal */}
      <div className="mt-6 flex flex-col items-center">
        <ProgressRing value={scores.overall} label={t("overall")} reveal={fresh} />
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
          <span>
            <b className="font-semibold text-ink">{m.pauses.count}</b> {t("pausesUnit")}
          </span>
        </div>
      </div>

      {/* The seven dimensions */}
      <section className="mt-8">
        <h2 className="text-sm font-medium text-accent">{t("categoryScores")}</h2>
        <div className="mt-3 flex flex-col gap-3">
          {headlineRows.map((r, i) => (
            <CategoryCard
              key={r.key}
              icon={r.icon}
              label={r.label}
              score={r.score}
              note={r.note}
              improve={r.improve}
              unmeasured={r.unmeasured}
              unmeasuredText={t("volumeUnmeasured")}
              delay={0.05 * i}
            />
          ))}
        </div>
      </section>

      {coaching && (
        <div className="mt-8 flex items-center gap-3 rounded-(--radius-card) bg-surface p-5 text-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-surface-2 border-t-accent" />
          {t("analyzing")}
        </div>
      )}

      {ai && !coaching && (
        <>
          {offline && (
            <div className="mt-8 flex flex-col gap-3 rounded-(--radius-card) bg-surface p-5">
              <p className="text-sm text-muted">{t("offlineCoach")}</p>
              <Button variant="gold" onClick={() => fetchCoaching(session)}>
                <Icon name="refresh" size={16} />
                {t("retryCoach")}
              </Button>
            </div>
          )}

          {/* Verdict */}
          {ai.summary && (
            <section className="mt-10">
              <h2 className="text-sm font-medium text-accent">{t("coachSummary")}</h2>
              <p className="lectern mt-3 text-lg leading-relaxed text-ink">{ai.summary}</p>
            </section>
          )}

          {/* What worked */}
          {ai.strengths.length > 0 && (
            <section className="mt-8 border-t hairline pt-6">
              <h2 className="text-sm font-medium text-ok">{t("whatWorked")}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {ai.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2.5 text-base text-ink/90">
                    <Icon name="check" size={18} className="mt-0.5 shrink-0 text-ok" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Say it better */}
          {ai.phrasing.rewrites.length > 0 && (
            <section className="mt-8 border-t hairline pt-6">
              <h2 className="text-sm font-medium text-accent">{t("sayItBetter")}</h2>
              <div className="mt-3 flex flex-col gap-5">
                {ai.phrasing.rewrites.map((r, i) => (
                  <div key={i}>
                    <p className="text-sm text-muted">
                      {t("yourVersion")}: <span className="quoted-phrase text-ink/70">“{r.original}”</span>
                    </p>
                    <p className="mt-1.5 text-sm text-muted">
                      {t("betterVersion")}: <span className="quoted-phrase text-accent">“{r.better}”</span>
                    </p>
                    <p className="mt-1.5 text-sm text-faint">{r.why}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Delivery detail */}
          <section className="mt-8 border-t hairline pt-6">
            <h2 className="text-sm font-medium text-muted">{t("deliveryDetail")}</h2>
            <dl className="mt-3 flex flex-col gap-4">
              {[
                [t("scoreFillers"), ai.fillerNote, delivery.fillers.improve],
                [t("scoreFluency"), ai.fluencyNote, delivery.fluency.improve],
                [t("scorePhrasing"), ai.phrasing.note, ai.phrasing.improve],
                [t("scoreProfessionalism"), ai.professionalism.note, ai.professionalism.improve],
              ]
                .filter(([, note]) => note)
                .map(([label, note, improve]) => (
                  <div key={label}>
                    <dt className="text-sm font-medium text-ink">{label}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink/85">{note}</dd>
                    {improve && (
                      <dd className="mt-1 flex gap-1.5 text-sm text-accent">
                        <Icon name="arrowRight" size={15} className="mt-0.5 shrink-0" />
                        <span>{improve}</span>
                      </dd>
                    )}
                  </div>
                ))}
            </dl>
            {ai.professionalism.flags.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1.5">
                {ai.professionalism.flags.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-warn">
                    <Icon name="shield" size={16} className="mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Next steps */}
          {ai.tips.length > 0 && (
            <section className="mt-8 border-t hairline pt-6">
              <h2 className="text-sm font-medium text-accent">{t("nextSteps")}</h2>
              <ol className="mt-3 flex flex-col gap-4">
                {ai.tips.map((tip, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="tnum mt-0.5 text-sm font-semibold text-accent-dim">{i + 1}</span>
                    <div>
                      <p className="font-medium text-ink">{tip.title}</p>
                      <p className="mt-0.5 text-sm text-muted">{tip.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Word of day */}
          {session.wordOfDay && ai.wordOfDay && (
            <p className={`mt-8 flex items-center gap-2 text-sm ${ai.wordOfDay.used ? "text-ok" : "text-muted"}`}>
              <Icon name={ai.wordOfDay.used ? "check" : "x"} size={16} />
              {ai.wordOfDay.used ? t("wordUsedYes") : t("wordUsedNo")}
              {ai.wordOfDay.comment && <span className="text-muted">— {ai.wordOfDay.comment}</span>}
            </p>
          )}
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

function CategoryCard({
  icon,
  label,
  score,
  note,
  improve,
  unmeasured,
  unmeasuredText,
  delay,
}: {
  icon: string;
  label: string;
  score: number | null;
  note?: string;
  improve?: string;
  unmeasured?: boolean;
  unmeasuredText: string;
  delay: number;
}) {
  const reduced = useReducedMotion();
  const barColor =
    score === null
      ? "var(--color-surface-2)"
      : score >= 85
        ? "var(--color-accent)"
        : score >= 60
          ? "var(--color-accent-dim)"
          : "var(--color-bad)";

  return (
    <div className="rounded-(--radius-card) bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Icon name={icon} size={18} className="shrink-0 text-accent" />
          <span className="lectern text-base text-ink">{label}</span>
        </div>
        {score !== null && (
          <span className="tnum flex items-baseline gap-1.5 whitespace-nowrap text-sm text-muted">
            <b className="font-semibold text-ink">{score}</b>
            /100
            <span className="font-medium text-accent">{gradeFor(score)}</span>
          </span>
        )}
      </div>

      {score !== null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <motion.div
            className="h-full rounded-full"
            style={{ background: barColor }}
            initial={reduced ? { width: `${score}%` } : { width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}

      {unmeasured && <p className="mt-2 text-sm leading-relaxed text-muted">{unmeasuredText}</p>}
      {note && <p className="mt-2.5 text-sm leading-relaxed text-ink/85">{note}</p>}
      {improve && (
        <p className="mt-1.5 flex gap-1.5 text-sm text-accent">
          <Icon name="arrowRight" size={15} className="mt-0.5 shrink-0" />
          <span>{improve}</span>
        </p>
      )}
    </div>
  );
}
