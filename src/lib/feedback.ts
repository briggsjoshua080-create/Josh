import type { AiFeedback, ContentFeedback, Lang } from "./types";

/** The API judges content from the transcript text only — no audio, no metrics. */
export interface CoachRequest {
  lang: Lang;
  promptTitle: string;
  promptText: string;
  transcript: string;
  wordOfDay?: string;
}

export class CoachUnavailableError extends Error {}

/** Strip an accidental ```json … ``` fence if the model wrapped its JSON. */
function stripFences(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  return t;
}

/** Parse the API response defensively: strip fences, fall back to the outer {…}. */
function parseContent(raw: string): ContentFeedback {
  const cleaned = stripFences(raw);
  try {
    return JSON.parse(cleaned) as ContentFeedback;
  } catch {
    // Last resort: grab the first {...last } span in case of stray prose.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as ContentFeedback;
    }
    throw new SyntaxError("unparseable coach response");
  }
}

/**
 * Call the serverless Claude proxy for the five text-only content categories.
 * Throws CoachUnavailableError on network failure, a non-OK status, or JSON
 * that can't be parsed — the caller renders an error state for these
 * categories while the offline pace/volume results still show.
 */
export async function requestCoaching(req: CoachRequest): Promise<AiFeedback> {
  let res: Response;
  try {
    res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    });
  } catch {
    throw new CoachUnavailableError("network");
  }
  if (!res.ok) throw new CoachUnavailableError(String(res.status));

  let content: ContentFeedback;
  try {
    content = parseContent(await res.text());
  } catch {
    throw new CoachUnavailableError("bad_json");
  }
  return { ...content, source: "claude" };
}

/** Simple stem-tolerant check for the word of the day (handles German inflection endings). */
export function wordOfDayUsed(transcript: string, word: string): boolean {
  const stem = word.toLowerCase().replace(/(e|en|n|s)$/u, "");
  return transcript.toLowerCase().includes(stem);
}

/**
 * The offline stand-in for the content half of the report. Content judgment
 * needs the API, so every category is a placeholder in an error state; the
 * results screen surfaces this and offers a retry. Pace and volume are
 * computed separately (src/lib/analysis.ts) and always render.
 */
export function offlineFeedback(lang: Lang): AiFeedback {
  const de = lang === "de";
  const note = de
    ? "Inhaltliche Bewertung nicht verfügbar — der Coach war nicht erreichbar."
    : "Content feedback unavailable — the coach couldn't be reached.";
  const improve = de
    ? "Geh online und tippe auf „KI-Coaching holen“, um Wortwahl, Struktur, Stil, Vollständigkeit und Logik bewerten zu lassen."
    : "Go online and tap “Get AI coaching” to score word choice, structure, style, comprehensiveness, and logic.";
  const cat = { score: 0, note, improve };
  return {
    eloquence: cat,
    structure: cat,
    style: cat,
    comprehensiveness: cat,
    logic: cat,
    summary: de
      ? "Offline-Analyse: Tempo und Lautstärke oben sind exakt. Für das inhaltliche Coaching geh online und hol dir das KI-Feedback nach."
      : "Offline analysis: pace and volume above are exact. Go online and fetch AI coaching for the read on your content.",
    source: "offline",
  };
}
