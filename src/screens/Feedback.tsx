import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { db, getSession } from "@/lib/db";
import { requestCoaching, offlineFeedback, wordOfDayUsed, CoachUnavailableError } from "@/lib/feedback";
import { paceCategory, volumeCategory, volumeScore } from "@/lib/analysis";
import { blendScores, CONTENT_CATEGORIES, type ContentCategoryId, type Session } from "@/lib/types";
import { FeedbackReport, type ReportRow } from "@/components/FeedbackReport";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

const CONTENT_LABEL: Record<ContentCategoryId, import("@/lib/strings").StringKey> = {
  eloquence: "scoreEloquence",
  structure: "scoreStructure",
  style: "scoreStyle",
  comprehensiveness: "scoreComprehensiveness",
  logic: "scoreLogic",
};

export function Feedback() {
  const { t, lang } = useI18n();
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
        wordOfDay: s.wordOfDay,
      });
    } catch (err) {
      if (!(err instanceof CoachUnavailableError)) console.error(err);
      ai = offlineFeedback(s.lang);
    }
    const scores = blendScores(s.metrics, ai);
    await db.sessions.update(s.id!, { ai, scores });
    setSession({ ...s, ai, scores });
    setCoaching(false);
    inFlight.current = false;
  }

  if (!session) return null;

  const { metrics: m, ai } = session;

  // Offline pace + volume — computed on-device, always available immediately.
  const paceRow: ReportRow = {
    id: "pace",
    label: t("scorePace"),
    data: paceCategory(m.wpm, lang),
    state: "ok",
  };
  const volumeAvailable = volumeScore(m.volume) !== null;
  const volumeRow: ReportRow = {
    id: "volume",
    label: t("scoreVolume"),
    data: volumeCategory(m.volume, lang),
    state: volumeAvailable ? "ok" : "error",
  };

  // API content categories — pending while the request is in flight, error when
  // it failed/was unavailable (source "offline") or when an older stored session
  // predates this category (guarded so legacy records never crash the render),
  // ok when Claude answered in the current shape.
  const contentRows: ReportRow[] = CONTENT_CATEGORIES.map((cid) => {
    const cd = ai?.[cid] as { score?: number; note?: string; improve?: string } | undefined;
    const valid = !!cd && typeof cd.score === "number";
    const state: ReportRow["state"] =
      coaching || !ai ? "pending" : ai.source === "claude" && valid ? "ok" : "error";
    return {
      id: cid,
      label: t(CONTENT_LABEL[cid]),
      data: valid ? (cd as ReportRow["data"]) : { score: 0, note: "", improve: "" },
      state,
    };
  });

  const rows: ReportRow[] = [paceRow, volumeRow, ...contentRows];
  const contentError = contentRows.some((r) => r.state === "error");
  const summary = ai && !coaching ? ai.summary : "";

  return (
    <div className="pt-2 lg:pt-0">
      <p className="text-sm text-muted">{session.promptTitle}</p>

      <div className="mt-6">
        <FeedbackReport
          rows={rows}
          summary={summary}
          reveal={fresh}
          labels={{ improve: t("improveLabel"), overall: t("overall"), summary: t("coachSummary") }}
          contentError={contentError}
          onRetry={() => fetchCoaching(session)}
          retryLabel={t("retryCoach")}
          errorNote={ai?.source === "offline" ? t("coachFailed") : t("contentUnavailable")}
        />
      </div>

      {/* Delivery stats — deterministic, computed offline */}
      <div className="tnum mt-8 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-muted">
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

      {/* Word of the day — offline transcript check */}
      {session.wordOfDay && (
        <p
          className={`mt-6 flex items-center justify-center gap-2 text-sm ${
            wordOfDayUsed(session.transcript, session.wordOfDay) ? "text-ok" : "text-muted"
          }`}
        >
          <Icon name={wordOfDayUsed(session.transcript, session.wordOfDay) ? "check" : "x"} size={16} />
          {wordOfDayUsed(session.transcript, session.wordOfDay) ? t("wordUsedYes") : t("wordUsedNo")}
        </p>
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
