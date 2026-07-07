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

/**
 * Hedge words and phrases that read as tentative. Counted on-device so the
 * Confidence metric has a deterministic anchor next to the AI's judgment.
 */
const HEDGES: Record<Lang, { single: string[]; multi: string[] }> = {
  en: {
    single: ["maybe", "perhaps", "possibly", "probably", "hopefully", "somewhat"],
    multi: ["i think", "i guess", "i suppose", "i feel like", "kind of", "sort of", "a little bit", "i'm not sure", "im not sure", "or something"],
  },
  de: {
    single: ["vielleicht", "eventuell", "möglicherweise", "wahrscheinlich", "hoffentlich", "irgendwie"],
    multi: ["ich glaube", "ich denke", "ich schätze", "ein bisschen", "oder so", "ich bin mir nicht sicher", "würde ich sagen"],
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

export function countHedges(segments: SpeechSegment[], lang: Lang) {
  const cfg = HEDGES[lang];
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
        const before = idx === 0 || joined[idx - 1] === " ";
        const after = idx + phrase.length === joined.length || joined[idx + phrase.length] === " ";
        if (before && after) bump(phrase);
        idx += phrase.length;
      }
    }
    for (const w of words) if (cfg.single.includes(w)) bump(w);
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { total, counts };
}

/**
 * Words-per-minute over time, from the finalized segment timestamps. Buckets
 * the speech into ~15–30s windows so the sparkline reads as a delivery arc,
 * not noise. Returns [] when there's too little timing data to be honest.
 */
export function wpmSeries(segments: SpeechSegment[], durationSec: number): number[] {
  if (durationSec < 20 || segments.length < 2) return [];
  const bins = Math.max(3, Math.min(12, Math.round(durationSec / 20)));
  const binMs = (durationSec * 1000) / bins;
  const counts = new Array(bins).fill(0) as number[];
  for (const seg of segments) {
    const words = tokenize(seg.text).length;
    // A segment's timestamp marks when it finalized — attribute its words there.
    const bin = Math.min(bins - 1, Math.floor(seg.t / binMs));
    counts[bin] += words;
  }
  const perMinute = 60_000 / binMs;
  const raw = counts.map((c) => c * perMinute);
  // Light 3-point smoothing: recognition finalizes in bursts, delivery doesn't.
  return raw.map((v, i) => {
    const window = [raw[i - 1], v, raw[i + 1]].filter((x): x is number => x !== undefined);
    return Math.round(window.reduce((a, b) => a + b, 0) / window.length);
  });
}

/** Longest stretch of speech without a detected pause, in whole seconds. */
export function cleanSpeechSeconds(pauses: PauseEvent[], durationSec: number): number {
  const cuts = [...pauses].sort((a, b) => a.atMs - b.atMs);
  let longest = 0;
  let cursor = 0;
  for (const p of cuts) {
    longest = Math.max(longest, p.atMs - cursor);
    cursor = p.atMs + p.durationMs;
  }
  longest = Math.max(longest, durationSec * 1000 - cursor);
  return Math.max(0, Math.round(longest / 1000));
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

export const PACE_BAND: Record<Lang, [number, number]> = {
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

/**
 * Projection score from the mic level meter. `mean`/`std` are 0–1 RMS over the
 * speaking frames. Rewards audible, steady projection; penalizes speaking too
 * quietly and large swings in loudness.
 */
export function volumeScore(mean: number, std: number): number {
  let s = 100;
  if (mean < 0.18) s -= (0.18 - mean) * 350;
  const cov = mean > 0 ? std / mean : 0;
  if (cov > 0.85) s -= (cov - 0.85) * 45;
  return Math.max(20, Math.min(100, Math.round(s)));
}

export function computeMetrics(input: {
  segments: SpeechSegment[];
  pauses: PauseEvent[];
  durationSec: number;
  lang: Lang;
  volume?: { mean: number; std: number } | null;
}): Metrics {
  const { segments, pauses, durationSec, lang } = input;
  const transcript = segments.map((s) => s.text).join(" ");
  const words = tokenize(transcript);
  const wordCount = words.length;
  const minutes = Math.max(durationSec / 60, 1 / 60);
  const wpm = Math.round(wordCount / minutes);

  const fillers = countFillers(segments, lang);
  const perMin = +(fillers.total / minutes).toFixed(1);
  const hedges = countHedges(segments, lang);
  const reps = countRepetitions(transcript);
  const repsPer100 = wordCount > 0 ? (reps.count / wordCount) * 100 : 0;

  const unique = new Set(words).size;
  const avgWordLen = wordCount > 0 ? +(words.join("").length / wordCount).toFixed(1) : 0;

  const volume =
    input.volume && wordCount > 0
      ? { mean: input.volume.mean, std: input.volume.std, score: volumeScore(input.volume.mean, input.volume.std) }
      : null;

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
    cleanSpeechSec: cleanSpeechSeconds(pauses, durationSec),
    vocab: {
      unique,
      ttr: wordCount > 0 ? +(unique / wordCount).toFixed(2) : 0,
      avgWordLen,
    },
    volume,
    hedges: { total: hedges.total, perMin: +(hedges.total / minutes).toFixed(1), counts: hedges.counts },
    paceScore: wordCount > 0 ? paceScore(wpm, lang) : 0,
    fillerScore: wordCount > 0 ? fillerScore(perMin) : 0,
    fluencyScore: wordCount > 0 ? fluencyScore(repsPer100) : 0,
  };
}
