import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { wordAtIndex } from "@/lib/daily";
import { SCENARIOS } from "@/data/scenarios";
import { SpeechSession, speechSupported } from "@/lib/speech";
import { mergeLegs, type Leg } from "@/lib/legs";
import { setHoldsUnsavedWork } from "@/lib/appUpdate";
import { computeMetrics } from "@/lib/metrics";
import { blendScores, type Scenario } from "@/lib/types";
import { computeEight } from "@/lib/progression";
import { wordOfDayUsed } from "@/lib/feedback";
import {
  dailyWordIndex,
  dailyScenarioId,
  requestPersistentStorage,
  saveSession,
  sessionDateISO,
} from "@/lib/db";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RecordRing, ringZone } from "@/components/RecordRing";
import { Waveform } from "@/components/Waveform";
import { CoachListening } from "@/components/CoachListening";

type Phase = "idle" | "recording" | "paused" | "analyzing";

function fmtTime(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, "0")}`;
}

export function Session() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const kind = params.get("kind") === "scenario" ? "scenario" : "daily";
  const day = Number(params.get("day") ?? 1);
  const scenarioId = params.get("id");
  const scenario = kind === "scenario" ? SCENARIOS.find((s) => s.id === scenarioId) : undefined;

  // The daily challenge is a random pick persisted per calendar date — the
  // same lookup Today.tsx uses, so both screens agree on today's scenario.
  const [dailyScenario, setDailyScenario] = useState<Scenario | null>(null);
  useEffect(() => {
    if (kind !== "daily") return;
    let live = true;
    dailyScenarioId(day).then((id) => {
      if (live) setDailyScenario(SCENARIOS.find((s) => s.id === id) ?? null);
    });
    return () => {
      live = false;
    };
  }, [kind, day]);

  // Today's word is a persisted random draw, so it has to come from IndexedDB
  // rather than from `day` — same row the Today screen reads, same word.
  const [wordIndex, setWordIndex] = useState<number | null>(null);
  useEffect(() => {
    if (kind !== "daily") return;
    let live = true;
    dailyWordIndex().then((i) => live && setWordIndex(i));
    return () => {
      live = false;
    };
  }, [kind]);
  const word = wordIndex === null ? undefined : wordAtIndex(wordIndex, lang);

  const active = scenario ?? dailyScenario;
  const promptTitle = active?.title[lang] ?? "";
  const promptText = active?.prompt[lang] ?? "";
  const targetSec = active?.targetSec ?? [45, 90];

  const [phase, setPhase] = useState<Phase>("idle");
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<
    "mic" | "unsupported" | "tooShort" | "saveFailed" | "recognition" | null
  >(null);
  const [typed, setTyped] = useState("");
  const [showType, setShowType] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

  const speechRef = useRef<SpeechSession | null>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const levelRef = useRef(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  /** Completed legs of this recording — a new leg starts each time a pause or
   *  a "too short" retry ends the previous one; Finish merges them all. */
  const legsRef = useRef<Leg[]>([]);
  /** When the current leg stopped, so resuming can measure the pause it opened. */
  const legEndedAtRef = useRef<number | null>(null);
  /** Whether any of this transcript was typed, which makes pace unscoreable. */
  const usedTypingRef = useRef(false);
  /** Wall-clock anchor for the on-screen timer, spanning pauses. */
  const recordingStartedAtRef = useRef<number | null>(null);
  const supported = speechSupported();

  /** Ring is full at 1.5× the target ceiling (at least +60s) — the hard "wrap it up" line. */
  const maxSec = Math.max(targetSec[1] + 60, Math.round(targetSec[1] * 1.5));

  // The clock keeps running while paused, because paused time now counts toward
  // the recording the same way silence on-mic does.
  //
  // Derived from a wall-clock anchor rather than by counting ticks: the interval
  // is torn down and rebuilt on every phase change, and each teardown discarded
  // the sub-second remainder. After a few pause/resume cycles the ring read up
  // to a second per leg BELOW the duration the score is computed from, so the
  // "wrap it up" warning could fail to fire on a recording that was over the max.
  useEffect(() => {
    if (phase !== "recording" && phase !== "paused") return;
    if (recordingStartedAtRef.current === null) recordingStartedAtRef.current = Date.now();
    const tick = () =>
      setElapsed(Math.floor((Date.now() - (recordingStartedAtRef.current ?? Date.now())) / 1000));
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ block: "end" });
  }, [finalText, interim]);

  // Hold off an auto-update reload while a take exists only in memory. Paused
  // and analyzing count: the legs aren't saved until finish() writes them.
  useEffect(() => {
    setHoldsUnsavedWork(phase === "recording" || phase === "paused" || phase === "analyzing");
  }, [phase]);

  // Released on unmount only. As a cleanup on the effect above it would run on
  // every phase change — so tapping Pause would flip the hold off for an
  // instant, and an update waiting behind it would reload and take the
  // unsaved take with it. Exactly the case the hold exists to prevent.
  useEffect(() => () => setHoldsUnsavedWork(false), []);

  useEffect(
    () => () => {
      speechRef.current?.stop();
    },
    [],
  );

  // The daily scenario resolves from IndexedDB (same draw Today.tsx made) —
  // usually near-instant, but the recording UI must wait for the real prompt
  // and target window rather than flash a placeholder one.
  if (kind === "daily" && !dailyScenario) {
    return (
      <div className="pt-2 lg:pt-0">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton mt-3 h-24" />
        <div className="mt-10 flex flex-1 flex-col items-center justify-center py-10">
          <div className="skeleton h-24 w-24 rounded-full" />
        </div>
      </div>
    );
  }

  async function start(resume = false) {
    setError(supported ? null : "unsupported");
    if (!resume) {
      legsRef.current = [];
      legEndedAtRef.current = null;
      usedTypingRef.current = false;
      setFinalText("");
      setInterim("");
      setElapsed(0);
      recordingStartedAtRef.current = null;
    } else if (legEndedAtRef.current !== null && legsRef.current.length > 0) {
      // Charge the time spent paused to the leg it followed, so the merge can
      // treat it the same way it treats silence on-mic.
      const paused = Date.now() - legEndedAtRef.current;
      const legs = legsRef.current;
      legs[legs.length - 1] = { ...legs[legs.length - 1], pausedAfterMs: paused };
      legEndedAtRef.current = null;
    }
    // Resuming from a pause (or a "too short" retry) picks the transcript up
    // where the previous leg left off, so the words already said aren't lost.
    const prefix = resume ? legsRef.current.flatMap((l) => l.segments.map((s) => s.text)).join(" ") : "";
    const session = new SpeechSession(lang, {
      onTranscript: (final, inter) => {
        setFinalText(prefix ? `${prefix} ${final}`.trim() : final);
        setInterim(inter);
      },
      onLevel: (level) => {
        levelRef.current = level;
        glowRef.current?.style.setProperty("--level", String(level));
      },
      onError: (code) => {
        if (code === "not-allowed") {
          // Actually tear the session down: it otherwise keeps its pause
          // interval and (where the mic itself was granted) its media stream,
          // leaving the browser's recording indicator lit with no way to clear
          // it — and start() would orphan it beyond reach.
          speechRef.current?.stop();
          speechRef.current = null;
          setError("mic");
          setPhase("idle");
        } else if (code === "unsupported") {
          setError("unsupported");
        } else if (code === "unknown") {
          // A dropped headset or blocked speech service used to be invisible:
          // the UI kept pulsing and the timer climbing while nothing recorded.
          setError("recognition");
        }
      },
    });
    speechRef.current = session;
    setPhase("recording");
    await session.start();
  }

  /** Stops the live recognizer (if any) and folds its result into legsRef. */
  function stopLeg() {
    const rec = speechRef.current;
    if (rec) {
      const result = rec.stop();
      speechRef.current = null;
      legEndedAtRef.current = Date.now();
      legsRef.current = [
        ...legsRef.current,
        {
          segments: result.segments,
          pauses: result.pauses,
          durationSec: result.durationSec,
          volume: result.volume,
          pausedAfterMs: 0,
        },
      ];
    }
    return mergeLegs(legsRef.current);
  }

  function pause() {
    if (!speechRef.current) return;
    stopLeg();
    setPhase("paused");
  }

  function discardNow() {
    speechRef.current?.stop();
    speechRef.current = null;
    legsRef.current = [];
    legEndedAtRef.current = null;
    usedTypingRef.current = false;
    recordingStartedAtRef.current = null;
    setConfirmingDiscard(false);
    setPhase("idle");
    setError(null);
    setFinalText("");
    setInterim("");
    setElapsed(0);
  }

  async function finish() {
    const merged = stopLeg();
    const transcript = merged.segments.map((s) => s.text).join(" ");
    if (transcript.trim().split(/\s+/).filter(Boolean).length < 10) {
      // Don't throw the recording away — pick the mic back up so what's
      // already been said keeps counting toward the ten-word minimum.
      await start(true);
      setError("tooShort");
      return;
    }

    setPhase("analyzing");
    try {
      await saveAndGo(merged, transcript);
    } catch (err) {
      // A failed write used to leave the user on an animation with no button
      // and no message, and reloading destroyed the take. The legs are still
      // in legsRef, so Finish can simply be tried again.
      console.error("Session: failed to save recording", err);
      setError("saveFailed");
      setPhase("paused");
    }
  }

  async function saveAndGo(merged: ReturnType<typeof mergeLegs>, transcript: string) {
    const metrics = computeMetrics({
      segments: merged.segments,
      pauses: merged.pauses,
      durationSec: merged.durationSec,
      lang,
      volume: merged.volume,
      typed: usedTypingRef.current,
    });

    // Both the date and the timestamp derive from the same instant: the start
    // of the recording. Stamping the date at save time would credit a take
    // that crossed midnight to the wrong day and break the streak.
    const startedAt = Date.now() - Math.round(merged.durationSec * 1000);

    const id = await saveSession({
      kind,
      refId: kind === "daily" ? dailyScenario!.id : scenarioId!,
      day: kind === "daily" ? day : undefined,
      lang,
      dateISO: sessionDateISO(startedAt),
      startedAt,
      durationSec: Math.round(merged.durationSec),
      transcript,
      segments: merged.segments,
      metrics,
      ai: null,
      scores: blendScores(metrics, null),
      report: null,
      // XP stays pending until the full AI analysis lands (no partial awards).
      progress: {
        scores: computeEight(metrics, null),
        overallScore: null,
        xpEarned: 0,
        wordOfDayUsed: word ? wordOfDayUsed(transcript, word.word) : false,
        wpm: metrics.wpm,
        xpPending: true,
      },
      promptTitle,
      promptText,
      wordOfDay: word?.word,
    });

    // Now that there is something worth keeping, ask the browser not to evict
    // it. Deliberately after the first successful save: any prompt then arrives
    // attached to work the user just did, not on a cold first launch.
    void requestPersistentStorage();

    navigate(`/feedback/${id}?fresh=1`, { replace: true });
  }

  function injectTyped() {
    const text = typed.trim();
    if (!text) return;
    usedTypingRef.current = true;
    const hook = (window as unknown as Record<string, unknown>).__oratoInjectSpeech;
    if (typeof hook === "function") (hook as (t: string) => void)(text);
    setTyped("");
  }

  const zone = ringZone(elapsed, targetSec, maxSec);

  return (
    <div className="flex min-h-[calc(100dvh-160px)] flex-col pt-2 lg:min-h-[calc(100dvh-120px)] lg:pt-0">
      {/* Prompt */}
      <div className="border-b hairline pb-5">
        <p className="text-sm text-muted">{promptTitle}</p>
        <p className="lectern mt-2 text-lg leading-relaxed text-ink/90">{promptText}</p>
        {word && phase !== "analyzing" && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-accent-dim">
            <Icon name="sparkle" size={14} />
            {t("useWord", { w: word.word })}
          </p>
        )}
      </div>

      {/* Errors */}
      {error === "mic" && <Notice tone="bad">{t("micDenied")}</Notice>}
      {error === "unsupported" && <Notice tone="warn">{t("speechUnsupported")}</Notice>}
      {error === "tooShort" && <Notice tone="warn">{t("tooShort")}</Notice>}
      {error === "saveFailed" && <Notice tone="bad">{`${t("saveFailedTitle")} ${t("saveFailedBody")}`}</Notice>}
      {error === "recognition" && <Notice tone="bad">{t("recognitionLost")}</Notice>}

      {/* Body */}
      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <p className="text-xl font-medium text-ink">{t("ready")}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{t("micHint")}</p>
          <button
            onClick={() => start()}
            aria-label={t("startRecording")}
            className="mt-10 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-white transition-colors duration-150 hover:bg-primary-bright active:bg-primary-deep"
          >
            <Icon name="mic" size={38} />
          </button>
          <p className="mt-4 text-sm font-medium text-muted">{t("startRecording")}</p>
        </div>
      )}

      {phase === "recording" && (
        <div className="flex flex-1 flex-col py-6">
          {/* Recording indicator: 8px bole dot, 2s pulse */}
          <div className="flex items-center justify-center">
            <span className="flex items-center gap-2 text-sm text-muted">
              <span className="rec-pulse h-2 w-2 rounded-full bg-bole" />
              {t("recordingLabel")}
            </span>
          </div>

          {/* Central gauge — mic-level glow now lives on the ring, not the button */}
          <div className="mt-5 flex flex-col items-center">
            <div ref={glowRef} className="spotlight-glow rounded-full">
              <RecordRing elapsed={elapsed} ideal={targetSec} maxSec={maxSec} />
            </div>
            <div className="tnum mt-3 flex items-center gap-4 text-xs text-muted">
              <span>{t("idealRange", { a: fmtTime(targetSec[0]), b: fmtTime(targetSec[1]) })}</span>
              <span aria-hidden="true">·</span>
              <span>{t("maxTime", { t: fmtTime(maxSec) })}</span>
            </div>
            {zone === "max" && (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-bad" data-testid="over-max">
                <span className="rec-pulse h-1.5 w-1.5 rounded-full bg-bad" />
                {t("overMaxHint")}
              </p>
            )}
          </div>

          {/* Live transcript: capped strip, top fade, interim words fade in */}
          <div
            className="box box-border mt-5 min-h-24 overflow-y-auto p-5"
            style={{
              maxHeight: 160,
              maskImage: "linear-gradient(to bottom, transparent 0, black 40px)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0, black 40px)",
            }}
          >
            <p
              className="lectern text-base text-ink"
              style={{ lineHeight: 1.7, overflowWrap: "break-word" }}
              data-testid="live-transcript"
            >
              {finalText}{" "}
              <span key={interim} className="fade-in-word text-faint">
                {interim}
              </span>
              {!finalText && !interim && <span className="text-faint">{t("waitingForSpeech")}</span>}
            </p>
            <div ref={transcriptEndRef} />
          </div>

          {/* Live level waveform — visual confirmation the mic is capturing */}
          <div className="mt-3">
            <Waveform levelRef={levelRef} />
          </div>

          {(error === "unsupported" || showType) && (
            <div className="mt-4 flex gap-2">
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && injectTyped()}
                placeholder={t("typeFallbackLabel")}
                data-testid="typed-fallback"
                className="box-control h-11 flex-1 px-4 text-base"
              />
              <Button variant="ghost" onClick={injectTyped}>
                {t("typeFallbackSubmit")}
              </Button>
            </div>
          )}

          {error !== "unsupported" && (
            <button
              onClick={() => setShowType((v) => !v)}
              className="mt-3 flex items-center gap-1.5 self-center text-xs text-muted transition-colors hover:text-ink"
            >
              <Icon name="keyboard" size={14} />
              {t("typeInstead")}
            </button>
          )}

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-6">
              <button
                onClick={pause}
                className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
              >
                <Icon name="pause" size={14} />
                {t("pauseRecording")}
              </button>
              <button
                onClick={() => setConfirmingDiscard(true)}
                className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
              >
                <Icon name="x" size={14} />
                {t("discard")}
              </button>
            </div>
            <button
              onClick={finish}
              aria-label={t("stopRecording")}
              data-testid="finish-recording"
              className="flex h-14 w-full items-center justify-center rounded-(--radius-pill) border border-bronze bg-claret text-base font-medium text-vellum transition-transform duration-150 active:scale-[0.98]"
            >
              {t("stopRecording")}
            </button>
          </div>
        </div>
      )}

      {phase === "paused" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
          <p className="tnum text-lg text-muted">{fmtTime(elapsed)}</p>
          <p className="text-base font-medium text-ink">{t("pausedLabel")}</p>
          <Button size="lg" className="w-full" onClick={() => start(true)}>
            <Icon name="mic" size={18} />
            {t("resumeRecording")}
          </Button>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setConfirmingDiscard(true)}
              className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
            >
              <Icon name="x" size={14} />
              {t("discard")}
            </button>
            <button
              onClick={finish}
              data-testid="finish-recording"
              className="flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-ink"
            >
              <Icon name="check" size={14} />
              {t("stopRecording")}
            </button>
          </div>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <CoachListening />
          <p className="mt-6 text-lg text-ink">{t("analyzing")}</p>
        </div>
      )}

      <ConfirmDialog
        open={confirmingDiscard}
        title={t("discardConfirmTitle")}
        confirmLabel={t("discardConfirmYes")}
        cancelLabel={t("discardConfirmCancel")}
        onCancel={() => setConfirmingDiscard(false)}
        onConfirm={discardNow}
      >
        {t("discardConfirmBody")}
      </ConfirmDialog>
    </div>
  );
}

function Notice({ tone, children }: { tone: "bad" | "warn"; children: string }) {
  return (
    <p
      className={`mt-4 rounded-(--radius-control) px-4 py-3 text-sm ${
        tone === "bad" ? "bg-bad/10 text-bad" : "bg-warn/10 text-warn"
      }`}
    >
      {children}
    </p>
  );
}
