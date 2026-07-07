import type { AiCategory, AiFeedback, Lang, Metrics } from "./types";

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

type JudgedCategory = "eloquence" | "structure" | "stylistic" | "comprehensiveness" | "logic";

const CATEGORY_FALLBACK: Record<JudgedCategory, Record<Lang, { low: { note: string; improve: string }; high: { note: string; improve: string } }>> = {
  eloquence: {
    en: {
      low: { note: "Word choice stayed serviceable rather than vivid — few images or precise verbs.", improve: "Replace one generic verb per minute with a sharper, more specific one." },
      high: { note: "Vocabulary was varied and specific in places.", improve: "Push one more concrete image into your opening line." },
    },
    de: {
      low: { note: "Die Wortwahl blieb brauchbar statt bildhaft — wenige Bilder oder präzise Verben.", improve: "Ersetze pro Minute ein generisches Verb durch ein schärferes, präziseres." },
      high: { note: "Der Wortschatz war stellenweise abwechslungsreich und präzise.", improve: "Bring ein weiteres konkretes Bild in deinen Einstiegssatz." },
    },
  },
  structure: {
    en: {
      low: { note: "The talk doesn't yet signal its parts — a listener can't easily tell where the opening ends and the body begins.", improve: "Add one clear signpost sentence between each section, like “Now let's turn to…”." },
      high: { note: "The arc holds — opening, body, and close are distinguishable.", improve: "Sharpen the transition into your close so it feels inevitable, not just next." },
    },
    de: {
      low: { note: "Die Rede markiert ihre Teile noch nicht — Zuhörer merken kaum, wo der Einstieg endet und der Hauptteil beginnt.", improve: "Füge zwischen den Abschnitten je einen klaren Übergangssatz ein, z. B. „Kommen wir nun zu…“." },
      high: { note: "Der Bogen trägt — Einstieg, Hauptteil und Schluss sind erkennbar.", improve: "Schärfe den Übergang zum Schluss, damit er zwingend wirkt, nicht nur als nächster Punkt." },
    },
  },
  stylistic: {
    en: {
      low: { note: "No rhetorical devices stood out — the delivery was direct but plain.", improve: "Build one rule-of-three list around your main claim." },
      high: { note: "At least one device landed and gave the delivery some shape.", improve: "Add a rhetorical question right before your strongest point to pull listeners in." },
    },
    de: {
      low: { note: "Kein Stilmittel ist aufgefallen — der Vortrag war direkt, aber schmucklos.", improve: "Baue eine Dreierfigur um deine Kernaussage." },
      high: { note: "Mindestens ein Stilmittel hat funktioniert und dem Vortrag Kontur gegeben.", improve: "Stelle direkt vor deiner stärksten Aussage eine rhetorische Frage, um die Zuhörer zu ziehen." },
    },
  },
  comprehensiveness: {
    en: {
      low: { note: "Real gaps remain — an obvious counterpoint or missing piece was left unaddressed.", improve: "Name the strongest objection yourself before someone else raises it." },
      high: { note: "The core ground was covered with no glaring omission.", improve: "Go one layer deeper on your strongest point instead of adding breadth." },
    },
    de: {
      low: { note: "Es bleiben echte Lücken — ein naheliegender Einwand oder fehlender Punkt wurde nicht angesprochen.", improve: "Nenne den stärksten Einwand selbst, bevor ihn jemand anders stellt." },
      high: { note: "Das Wesentliche wurde abgedeckt, keine auffällige Lücke.", improve: "Vertiefe deinen stärksten Punkt, statt in die Breite zu gehen." },
    },
  },
  logic: {
    en: {
      low: { note: "At least one claim needs a bridge — the reasoning jumps from evidence to conclusion.", improve: "Add one sentence that explicitly connects your evidence to your conclusion." },
      high: { note: "The reasoning held together without unbridged jumps.", improve: "Pressure-test it: state the strongest counter-argument and knock it down in one line." },
    },
    de: {
      low: { note: "Mindestens eine Behauptung braucht eine Brücke — die Argumentation springt von Beleg zu Schluss.", improve: "Füge einen Satz ein, der deinen Beleg explizit mit deinem Schluss verbindet." },
      high: { note: "Die Argumentation hielt zusammen, ohne unüberbrückte Sprünge.", improve: "Stress-teste sie: Nenne den stärksten Gegeneinwand und entkräfte ihn in einem Satz." },
    },
  },
};

/**
 * Backstop for when the coach's response comes back with a missing or
 * too-short note/improve for one of the five judged categories (should be
 * rare now that the schema enforces a minimum length, but the UI must never
 * show a blank card). Not used when the AI text is already substantive.
 */
export function categoryFallback(key: JudgedCategory, score: number, lang: Lang): { note: string; improve: string } {
  return CATEGORY_FALLBACK[key][lang][score >= 70 ? "high" : "low"];
}

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

export interface CategoryCoaching {
  note?: string;
  improve: string;
}

/**
 * Deterministic per-category coaching for the delivery signals the client
 * measures directly (pace, loudness, fillers, fluency). The AI writes the
 * pace/filler/fluency *notes* when online; these "improve" lines are computed
 * from the numbers so every category carries one actionable next step even
 * offline. Volume is fully client-side (the coach never hears the audio).
 */
export function deliveryCoaching(
  m: Metrics,
  lang: Lang,
): {
  pace: CategoryCoaching;
  volume: (CategoryCoaching & { note: string }) | null;
  fillers: CategoryCoaching;
  fluency: CategoryCoaching;
} {
  const de = lang === "de";
  const band = { lo: lang === "de" ? 105 : 115, hi: lang === "de" ? 155 : 165 };

  const paceImprove =
    m.wpm < band.lo
      ? de
        ? "Nimm mehr Zug nach vorn und lass die letzten Wörter jedes Satzes nicht ausklingen."
        : "Add forward drive and stop letting the last words of each sentence trail off."
      : m.wpm > band.hi
        ? de
          ? "Setze bewusste Pausen vor deinen Kernaussagen, damit sie landen können."
          : "Plant a deliberate pause before your key points so they land."
        : de
          ? "Halte das Tempo, aber verlangsame kurz vor deiner wichtigsten Zeile."
          : "Hold this tempo, but slow down just before your most important line.";

  const fillersImprove =
    m.fillerScore >= 85
      ? de
        ? "Bleib so — deine Füllwörter sind bereits selten. Halte die Pausen bewusst."
        : "Keep this — your fillers are already rare. Own the silent pauses."
      : de
        ? "Ersetze bewusst jedes „äh“ durch eine stille Sekunde statt eines Lauts."
        : "Consciously replace each “um” with one silent beat instead of a sound.";

  const fluencyImprove =
    m.fluencyScore >= 85
      ? de
        ? "Dein Redefluss steht — halte ihn, wenn du morgen die Länge steigerst."
        : "Your flow holds — keep it as you stretch the length tomorrow."
      : de
        ? "Wenn du dich verhaspelst: Satz abbrechen, kurz atmen, den ganzen Satz neu."
        : "When you trip: kill the sentence, take a breath, restart the whole sentence.";

  let volume: (CategoryCoaching & { note: string }) | null = null;
  if (m.volume) {
    const { mean, score } = m.volume;
    if (mean < 0.13) {
      volume = {
        note: de
          ? "Deine Projektion blieb leise — die letzte Reihe müsste sich anstrengen."
          : "Your projection stayed low — the back row would strain to hear you.",
        improve: de
          ? "Sprich aus dem Zwerchfell und richte die Stimme auf die hintere Wand, nicht aufs Mikro."
          : "Speak from your diaphragm and aim your voice at the far wall, not the mic.",
      };
    } else if (score >= 85) {
      volume = {
        note: de
          ? "Kräftige, gleichmäßige Projektion — du hast den Raum gefüllt."
          : "Strong, steady projection — you filled the room.",
        improve: de
          ? "Heb die Lautstärke kurz vor deiner stärksten Zeile noch eine Stufe an."
          : "Push volume up a notch right before your strongest line for emphasis.",
      };
    } else {
      volume = {
        note: de
          ? "Hörbar, aber ungleichmäßig — die Lautstärke sackte stellenweise ab."
          : "Audible but uneven — your volume sagged in places.",
        improve: de
          ? "Halte die Energie durch die Mitte, statt zwischen den Punkten leiser zu werden."
          : "Keep the energy up through the middle — don't let volume dip between points.",
      };
    }
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
