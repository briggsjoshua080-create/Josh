import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { db, getSession } from "@/lib/db";
import { requestCoaching, offlineFeedback, CoachUnavailableError } from "@/lib/feedback";
import { blendScores, type Session } from "@/lib/types";
import { ProgressRing } from "@/components/ProgressRing";
import { ScoreBar } from "@/components/ScoreBar";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

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

      {/* Category scores */}
      <div className="mt-8 flex flex-col gap-3">
        <ScoreBar label={t("scorePace")} value={scores.pace} delay={0.05} />
        <ScoreBar label={t("scoreFillers")} value={scores.fillers} delay={0.1} />
        <ScoreBar label={t("scoreFluency")} value={scores.fluency} delay={0.15} />
        <ScoreBar label={t("scoreEloquence")} value={scores.eloquence} delay={0.2} />
        <ScoreBar label={t("scorePhrasing")} value={scores.phrasing} delay={0.25} />
        <ScoreBar label={t("scoreProfessionalism")} value={scores.professionalism} delay={0.3} />
      </div>

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

          {/* Category notes */}
          <section className="mt-8 border-t hairline pt-6">
            <dl className="flex flex-col gap-4">
              {[
                [t("scorePace"), ai.paceNote],
                [t("scoreFillers"), ai.fillerNote],
                [t("scoreFluency"), ai.fluencyNote],
                [t("scoreEloquence"), ai.eloquence.note],
                [t("scorePhrasing"), ai.phrasing.note],
                [t("scoreProfessionalism"), ai.professionalism.note],
              ]
                .filter(([, note]) => note)
                .map(([label, note]) => (
                  <div key={label}>
                    <dt className="text-sm font-medium text-muted">{label}</dt>
                    <dd className="mt-1 text-base text-ink/90">{note}</dd>
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
