import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { challengeForDay, wordForDay } from "@/lib/daily";
import { SCENARIOS } from "@/data/scenarios";
import { SpeechSession, speechSupported } from "@/lib/speech";
import { computeMetrics } from "@/lib/metrics";
import { blendScores } from "@/lib/types";
import { computeEight } from "@/lib/progression";
import { wordOfDayUsed } from "@/lib/feedback";
import { saveSession, todayISO } from "@/lib/db";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

type Phase = "idle" | "recording" | "analyzing";

export function Session() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const kind = params.get("kind") === "scenario" ? "scenario" : "daily";
  const day = Number(params.get("day") ?? 1);
  const scenarioId = params.get("id");
  const scenario = kind === "scenario" ? SCENARIOS.find((s) => s.id === scenarioId) : undefined;
  const challenge = kind === "daily" ? challengeForDay(day) : undefined;
  const word = kind === "daily" ? wordForDay(day, lang) : undefined;

  const promptTitle = (scenario?.title ?? challenge!.title)[lang];
  const promptText = (scenario?.prompt ?? challenge!.prompt)[lang];
  const targetSec = scenario?.targetSec ?? challenge!.targetSec;

  const [phase, setPhase] = useState<Phase>("idle");
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<"mic" | "unsupported" | "tooShort" | null>(null);
  const [typed, setTyped] = useState("");
  const [showType, setShowType] = useState(false);

  const speechRef = useRef<SpeechSession | null>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const supported = speechSupported();

  useEffect(() => {
    if (phase !== "recording") return;
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ block: "end" });
  }, [finalText, interim]);

  useEffect(
    () => () => {
      speechRef.current?.stop();
    },
    [],
  );

  async function start() {
    setError(supported ? null : "unsupported");
    setFinalText("");
    setInterim("");
    setElapsed(0);
    const session = new SpeechSession(lang, {
      onTranscript: (final, inter) => {
        setFinalText(final);
        setInterim(inter);
      },
      onLevel: (level) => {
        glowRef.current?.style.setProperty("--level", String(level));
      },
      onError: (code) => {
        if (code === "not-allowed") {
          setError("mic");
          setPhase("idle");
        } else if (code === "unsupported") {
          setError("unsupported");
        }
      },
    });
    speechRef.current = session;
    setPhase("recording");
    await session.start();
  }

  function discard() {
    speechRef.current?.stop();
    speechRef.current = null;
    setPhase("idle");
    setFinalText("");
    setInterim("");
    setElapsed(0);
  }

  async function finish() {
    const rec = speechRef.current;
    if (!rec) return;
    const result = rec.stop();
    speechRef.current = null;

    const transcript = result.segments.map((s) => s.text).join(" ");
    if (transcript.trim().split(/\s+/).filter(Boolean).length < 10) {
      setError("tooShort");
      setPhase("idle");
      return;
    }

    setPhase("analyzing");
    const metrics = computeMetrics({
      segments: result.segments,
      pauses: result.pauses,
      durationSec: result.durationSec,
      lang,
      volume: result.volume,
    });

    const id = await saveSession({
      kind,
      refId: kind === "daily" ? `day-${day}` : scenarioId!,
      day: kind === "daily" ? day : undefined,
      lang,
      dateISO: todayISO(),
      startedAt: Date.now() - Math.round(result.durationSec * 1000),
      durationSec: Math.round(result.durationSec),
      transcript,
      segments: result.segments,
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

    navigate(`/feedback/${id}?fresh=1`, { replace: true });
  }

  function injectTyped() {
    const text = typed.trim();
    if (!text) return;
    const hook = (window as unknown as Record<string, unknown>).__oratoInjectSpeech;
    if (typeof hook === "function") (hook as (t: string) => void)(text);
    setTyped("");
  }

  const timeStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const overTarget = elapsed > targetSec[1];

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

      {/* Body */}
      {phase === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <p className="text-xl font-medium text-ink">{t("ready")}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{t("micHint")}</p>
          <button
            onClick={start}
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
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted">
              <span className="h-2 w-2 rounded-full bg-primary-bright" />
              {t("listening")}
            </span>
            <span className={`tnum text-lg font-medium ${overTarget ? "text-warn" : "text-ink"}`}>{timeStr}</span>
          </div>

          <div className="mt-4 max-h-[40vh] flex-1 overflow-y-auto rounded-(--radius-card) bg-surface p-5">
            <p className="lectern text-lg leading-relaxed text-ink" data-testid="live-transcript">
              {finalText} <span className="text-muted">{interim}</span>
              {!finalText && !interim && <span className="text-faint">…</span>}
            </p>
            <div ref={transcriptEndRef} />
          </div>

          {(error === "unsupported" || showType) && (
            <div className="mt-4 flex gap-2">
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && injectTyped()}
                placeholder={t("typeFallbackLabel")}
                data-testid="typed-fallback"
                className="h-11 flex-1 rounded-(--radius-control) border border-line bg-surface-2 px-4 text-base text-ink placeholder:text-muted"
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

          <div className="mt-6 flex items-center justify-center gap-8">
            <button
              onClick={discard}
              className="flex flex-col items-center gap-1.5 text-muted transition-colors hover:text-ink"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line">
                <Icon name="x" size={20} />
              </span>
              <span className="text-xs">{t("discard")}</span>
            </button>
            <div ref={glowRef} className="spotlight-glow rounded-full">
              <button
                onClick={finish}
                aria-label={t("stopRecording")}
                data-testid="finish-recording"
                className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white transition-colors duration-150 hover:bg-primary-bright"
              >
                <Icon name="stop" size={30} />
              </button>
            </div>
            <span className="w-12" aria-hidden="true" />
          </div>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-surface-2 border-t-accent" />
          <p className="mt-6 text-lg text-ink">{t("analyzing")}</p>
        </div>
      )}
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
