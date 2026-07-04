import type { AiFeedback, Lang, Metrics } from "./types";

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

/** Call the serverless Claude proxy. Throws CoachUnavailableError when offline/unconfigured. */
export async function requestCoaching(req: CoachRequest): Promise<AiFeedback> {
  let res: Response;
  try {
    res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...req, metrics: { ...req.metrics, durationSec: undefined } }),
    });
  } catch {
    throw new CoachUnavailableError("network");
  }
  if (!res.ok) throw new CoachUnavailableError(String(res.status));
  const data = (await res.json()) as Omit<AiFeedback, "source">;
  return { ...data, source: "claude" };
}

/** Simple stem-tolerant check for the word of the day (handles German inflection endings). */
export function wordOfDayUsed(transcript: string, word: string): boolean {
  const stem = word.toLowerCase().replace(/(e|en|n|s)$/u, "");
  return transcript.toLowerCase().includes(stem);
}

/**
 * Deterministic metrics-only coaching for offline use. Honest about its
 * limits — the UI labels it and offers a retry when back online.
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

  return {
    eloquence: { score: 0, note: "" },
    phrasing: { score: 0, note: "", rewrites: [] },
    professionalism: { score: 0, note: "", flags: [] },
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
