import type { AiCategory, AiFeedback, AiReport, Lang, Metrics } from "./types";
import { METRIC_KEYS } from "./types";
import { coachingCopy, volumeCopy, type CoachingVariants } from "./strings";

export interface CoachRequest {
  lang: Lang;
  promptTitle: string;
  promptText: string;
  transcript: string;
  durationSec: number;
  wordOfDay?: string;
  metrics: Metrics;
}

export class CoachUnavailableError extends Error {}

/** Hard ceiling on one analysis round-trip — the spinner must never be infinite. */
const COACH_TIMEOUT_MS = 45_000;

/** Remove accidental markdown code fences around a JSON payload. */
function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

/**
 * Fetch the structured 8-metric coaching report. Throws CoachUnavailableError
 * on network failure, non-OK status, timeout, or an unparseable payload —
 * callers show the offline/pending state instead of spinning forever.
 */
export async function requestReport(req: CoachRequest): Promise<AiReport> {
  let res: Response;
  try {
    res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...req, metrics: { ...req.metrics, durationSec: undefined } }),
      signal: AbortSignal.timeout(COACH_TIMEOUT_MS),
    });
  } catch {
    throw new CoachUnavailableError("network");
  }
  if (!res.ok) throw new CoachUnavailableError(String(res.status));

  let report: AiReport;
  try {
    report = JSON.parse(stripFences(await res.text())) as AiReport;
  } catch {
    throw new CoachUnavailableError("bad_json");
  }
  if (
    typeof report !== "object" ||
    report === null ||
    typeof report.scores !== "object" ||
    typeof report.oneLiners !== "object" ||
    METRIC_KEYS.some((k) => typeof report.scores?.[k] !== "number")
  ) {
    throw new CoachUnavailableError("bad_shape");
  }
  return report;
}

export interface CategoryCoaching {
  note?: string;
  improve: string;
}

/** Pick one phrasing variant for the given language, rotated by seed. */
function pickVariant(variants: CoachingVariants, lang: Lang, seed: number): string {
  const list = variants[lang];
  return list[seed % list.length];
}

/**
 * Deterministic per-category coaching for the delivery signals the client
 * measures directly (pace, loudness, fillers, fluency). The AI writes the
 * pace/filler/fluency *notes* when online; these "improve" lines are computed
 * from the numbers so every category carries one actionable next step even
 * offline. Volume is fully client-side (the coach never hears the audio).
 *
 * Each "improve" line has 2–3 phrasings (see coachingCopy in strings.ts),
 * rotated by `variantSeed`. The default seed derives from the session's own
 * metrics, so a report reads the same on every re-render but the wording
 * varies from session to session.
 */
export function deliveryCoaching(
  m: Metrics,
  lang: Lang,
  variantSeed?: number,
): {
  pace: CategoryCoaching;
  volume: (CategoryCoaching & { note: string }) | null;
  fillers: CategoryCoaching;
  fluency: CategoryCoaching;
} {
  const seed = Math.abs(Math.round(
    variantSeed ?? m.wordCount + m.durationSec + m.fillers.total + m.wpm,
  ));
  const band = { lo: lang === "de" ? 105 : 115, hi: lang === "de" ? 155 : 165 };

  const paceImprove = pickVariant(
    m.wpm < band.lo
      ? coachingCopy.feedbackPaceSlowImprove
      : m.wpm > band.hi
        ? coachingCopy.feedbackPaceFastImprove
        : coachingCopy.feedbackPaceGoodImprove,
    lang,
    seed,
  );

  const fillersImprove = pickVariant(
    m.fillerScore >= 85 ? coachingCopy.feedbackFillersGoodImprove : coachingCopy.feedbackFillersHighImprove,
    lang,
    seed,
  );

  const fluencyImprove = pickVariant(
    m.fluencyScore >= 85 ? coachingCopy.feedbackFluencyGoodImprove : coachingCopy.feedbackFluencyLowImprove,
    lang,
    seed,
  );

  let volume: (CategoryCoaching & { note: string }) | null = null;
  if (m.volume) {
    const { mean, score } = m.volume;
    const kind = mean < 0.13 ? "Low" : score >= 85 ? "Good" : "Uneven";
    volume = {
      note: volumeCopy[`feedbackVolume${kind}Note`][lang],
      improve: volumeCopy[`feedbackVolume${kind}Improve`][lang],
    };
  }

  return {
    pace: { improve: paceImprove },
    volume,
    fillers: { improve: fillersImprove },
    fluency: { improve: fluencyImprove },
  };
}

/** Simple stem-tolerant check for the word of the day (handles German inflection endings). */
export function wordOfDayUsed(transcript: string, word: string): boolean {
  const stem = word.toLowerCase().replace(/(e|en|n|s)$/u, "");
  return transcript.toLowerCase().includes(stem);
}

/**
 * @deprecated Legacy offline coaching in the pre-progression AiFeedback shape.
 * The redesigned Feedback screen renders offline state from computeEight() +
 * deliveryCoaching() directly; this stays only until old stored sessions age out.
 */
export function offlineFeedback(input: {
  metrics: Metrics;
  lang: Lang;
  transcript: string;
  wordOfDay?: string;
}): AiFeedback {
  const { metrics: m, lang, transcript, wordOfDay } = input;
  const de = lang === "de";

  const paceNote =
    m.paceScore >= 90
      ? de
        ? `${m.wpm} Wörter pro Minute — ein Tempo, dem man mühelos folgt.`
        : `${m.wpm} words per minute — a pace an audience follows without effort.`
      : m.wpm < 110
        ? de
          ? `${m.wpm} WpM ist gemächlich. Etwas mehr Zug nach vorn hält die Aufmerksamkeit.`
          : `${m.wpm} wpm runs slow. A touch more forward drive will hold attention.`
        : de
          ? `${m.wpm} WpM ist flott. Setze bewusste Pausen, damit Pointen landen können.`
          : `${m.wpm} wpm is quick. Plant deliberate pauses so your points can land.`;

  const topFiller = Object.entries(m.fillers.counts).sort((a, b) => b[1] - a[1])[0];
  const fillerNote =
    m.fillers.total === 0
      ? de
        ? "Keine Füllwörter erkannt — bemerkenswert sauber."
        : "No filler words detected — remarkably clean."
      : de
        ? `${m.fillers.total} Füllwörter (${m.fillers.perMin}/Min.), am häufigsten „${topFiller?.[0]}“. Ersetze sie durch stille Pausen.`
        : `${m.fillers.total} fillers (${m.fillers.perMin}/min), most often “${topFiller?.[0]}”. Replace them with silent pauses.`;

  const fluencyNote =
    m.repetitions.count === 0
      ? de
        ? "Keine Stotterer oder Wortwiederholungen — der Redefluss stand."
        : "No stutters or repeated words — your flow held."
      : de
        ? `${m.repetitions.count} ${m.repetitions.count === 1 ? "Wiederholung" : "Wiederholungen"} (z. B. „${m.repetitions.examples[0] ?? ""}“). Kurz stoppen, atmen, neu ansetzen.`
        : `${m.repetitions.count} ${m.repetitions.count === 1 ? "repetition" : "repetitions"} (e.g. “${m.repetitions.examples[0] ?? ""}”). Stop, breathe, restart the sentence cleanly.`;

  const tips: AiFeedback["tips"] = [];
  if (m.fillerScore < 85)
    tips.push(
      de
        ? { title: "Pausen statt Füllwörter", detail: "Nimm morgen denselben Prompt auf und ersetze jedes „äh“ bewusst durch eine stille Sekunde. Stille wirkt souverän — Füllwörter nicht." }
        : { title: "Trade fillers for silence", detail: "Re-record tomorrow's prompt and consciously replace every “um” with one silent beat. Silence reads as command; fillers don't." },
    );
  if (m.paceScore < 85)
    tips.push(
      de
        ? { title: "Tempo kalibrieren", detail: "Sprich 60 Sekunden auf einen Metronom-Schlag von 2 Wörtern pro Sekunde. So eichst du dein Gefühl für 120–140 WpM." }
        : { title: "Calibrate your pace", detail: "Speak for 60 seconds at roughly two words per beat with a metronome. That trains your feel for the 120–150 wpm sweet spot." },
    );
  if (m.fluencyScore < 85)
    tips.push(
      de
        ? { title: "Sauber neu ansetzen", detail: "Wenn du dich verhaspelst: Satz abbrechen, eine Sekunde Pause, ganzen Satz neu. Halbe Reparaturen hört jeder." }
        : { title: "Restart cleanly", detail: "When you trip: kill the sentence, take one beat, restart the whole sentence. Everyone hears half-repairs." },
    );
  if (tips.length < 2)
    tips.push(
      de
        ? { title: "Länge ausreizen", detail: "Deine Werte sind stabil — geh morgen eine Stufe höher: gleiche Aufgabe, 30 Sekunden länger, ohne Qualitätsverlust." }
        : { title: "Stretch the length", detail: "Your delivery held up — push a level tomorrow: same task, 30 seconds longer, no drop in control." },
    );

  const strengths: string[] = [];
  const best = Math.max(m.paceScore, m.fillerScore, m.fluencyScore);
  if (best === m.paceScore) strengths.push(de ? "Dein Tempo war die stabilste Größe dieser Session." : "Your pacing was the steadiest part of this session.");
  else if (best === m.fillerScore) strengths.push(de ? "Füllwort-Disziplin war die Stärke dieser Session." : "Filler discipline was the strength of this session.");
  else strengths.push(de ? "Dein Redefluss war die Stärke dieser Session." : "Your fluency was the strength of this session.");

  const empty: AiCategory = { score: 0, note: "", improve: "" };
  return {
    eloquence: empty,
    structure: empty,
    stylistic: empty,
    comprehensiveness: empty,
    logic: empty,
    phrasing: { ...empty, rewrites: [] },
    professionalism: { ...empty, flags: [] },
    paceNote,
    fillerNote,
    fluencyNote,
    summary: de
      ? "Offline-Analyse: Die Messwerte oben sind exakt; für das volle Coaching zu Wortwahl und Ausdruck geh online und hol dir das KI-Feedback nach."
      : "Offline analysis: the numbers above are exact; go online and fetch AI coaching for the full read on wording and expression.",
    strengths,
    tips: tips.slice(0, 3),
    wordOfDay: wordOfDay
      ? { used: wordOfDayUsed(transcript, wordOfDay), comment: "" }
      : undefined,
    source: "offline",
  };
}
