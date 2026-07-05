import type { Lang, Metrics, PauseEvent, SpeechSegment } from "./types";

/**
 * Deterministic speech metrics. Everything here is computed client-side from
 * the transcript + timing so pace/filler/fluency numbers never drift between
 * sessions the way LLM-judged scores can.
 */

const FILLERS: Record<Lang, { single: string[]; multi: string[]; segmentInitial: string[] }> = {
  en: {
    single: ["um", "uh", "er", "erm", "ah", "hmm", "basically", "literally", "actually"],
    multi: ["you know", "i mean", "sort of", "kind of"],
    segmentInitial: ["so", "well", "like"],
  },
  de: {
    single: ["äh", "ähm", "öh", "öhm", "hm", "halt", "quasi", "sozusagen", "irgendwie", "gell", "ne"],
    multi: ["keine ahnung", "oder so", "und so weiter", "im prinzip", "sag ich mal"],
    segmentInitial: ["also", "ja", "naja"],
  },
};

/** "like" as a filler, excluding the verb ("I like", "you'd like", …). */
const LIKE_VERB_PRECEDERS = new Set(["i", "you", "we", "they", "would", "d", "not", "dont", "don't", "really"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"()„“”‚’]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function countFillers(segments: SpeechSegment[], lang: Lang) {
  const cfg = FILLERS[lang];
  const counts: Record<string, number> = {};
  const bump = (w: string) => {
    counts[w] = (counts[w] ?? 0) + 1;
  };

  for (const seg of segments) {
    const words = tokenize(seg.text);
    const joined = words.join(" ");

    for (const phrase of cfg.multi) {
      let idx = 0;
      while ((idx = joined.indexOf(phrase, idx)) !== -1) {
        // Whole-word boundary check on both sides of the phrase.
        const before = idx === 0 || joined[idx - 1] === " ";
        const after = idx + phrase.length === joined.length || joined[idx + phrase.length] === " ";
        if (before && after) bump(phrase);
        idx += phrase.length;
      }
    }

    words.forEach((w, i) => {
      if (cfg.single.includes(w)) {
        bump(w);
        return;
      }
      if (i === 0 && cfg.segmentInitial.includes(w) && w !== "like") {
        bump(w);
        return;
      }
      if (lang === "en" && w === "like") {
        const prev = words[i - 1];
        if (i > 0 && !LIKE_VERB_PRECEDERS.has(prev ?? "")) bump("like");
      }
    });
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { total, counts };
}

export function countRepetitions(text: string) {
  const words = tokenize(text);
  let count = 0;
  const examples: string[] = [];
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1] && words[i].length > 1) {
      count++;
      if (examples.length < 4) examples.push(`${words[i]} ${words[i]}`);
    }
  }
  // Immediate bigram stutters: "I went I went"
  for (let i = 3; i < words.length; i++) {
    if (words[i] === words[i - 2] && words[i - 1] === words[i - 3]) {
      count++;
      if (examples.length < 4) examples.push(`${words[i - 3]} ${words[i - 2]} ${words[i - 3]} ${words[i - 2]}`);
      i += 1;
    }
  }
  return { count, examples };
}

const PACE_BAND: Record<Lang, [number, number]> = {
  en: [115, 165],
  de: [105, 155],
};

export function paceScore(wpm: number, lang: Lang): number {
  const [lo, hi] = PACE_BAND[lang];
  if (wpm >= lo && wpm <= hi) return 100;
  const dist = wpm < lo ? lo - wpm : wpm - hi;
  return Math.max(20, Math.round(100 - dist * 1.2));
}

export function fillerScore(perMin: number): number {
  return Math.max(15, Math.min(100, Math.round(100 - perMin * 8)));
}

export function fluencyScore(repsPer100Words: number): number {
  return Math.max(20, Math.min(100, Math.round(100 - repsPer100Words * 12)));
}

export function computeMetrics(input: {
  segments: SpeechSegment[];
  pauses: PauseEvent[];
  durationSec: number;
  lang: Lang;
}): Metrics {
  const { segments, pauses, durationSec, lang } = input;
  const transcript = segments.map((s) => s.text).join(" ");
  const words = tokenize(transcript);
  const wordCount = words.length;
  const minutes = Math.max(durationSec / 60, 1 / 60);
  const wpm = Math.round(wordCount / minutes);

  const fillers = countFillers(segments, lang);
  const perMin = +(fillers.total / minutes).toFixed(1);
  const reps = countRepetitions(transcript);
  const repsPer100 = wordCount > 0 ? (reps.count / wordCount) * 100 : 0;

  const unique = new Set(words).size;
  const avgWordLen = wordCount > 0 ? +(words.join("").length / wordCount).toFixed(1) : 0;

  return {
    durationSec: Math.round(durationSec),
    wordCount,
    wpm,
    fillers: { total: fillers.total, perMin, counts: fillers.counts },
    repetitions: reps,
    pauses: {
      count: pauses.length,
      longestMs: pauses.reduce((m, p) => Math.max(m, p.durationMs), 0),
    },
    vocab: {
      unique,
      ttr: wordCount > 0 ? +(unique / wordCount).toFixed(2) : 0,
      avgWordLen,
    },
    paceScore: wordCount > 0 ? paceScore(wpm, lang) : 0,
    fillerScore: wordCount > 0 ? fillerScore(perMin) : 0,
    fluencyScore: wordCount > 0 ? fluencyScore(repsPer100) : 0,
  };
}
