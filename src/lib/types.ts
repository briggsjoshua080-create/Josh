export type Lang = "en" | "de";

export interface Bilingual {
  en: string;
  de: string;
}

/** One finalized speech-recognition result with its arrival time (ms since recording start). */
export interface SpeechSegment {
  text: string;
  t: number;
}

export interface PauseEvent {
  atMs: number;
  durationMs: number;
}

export interface Metrics {
  durationSec: number;
  wordCount: number;
  wpm: number;
  fillers: {
    total: number;
    perMin: number;
    counts: Record<string, number>;
  };
  repetitions: {
    count: number;
    examples: string[];
  };
  pauses: {
    count: number;
    longestMs: number;
  };
  /**
   * Longest unbroken stretch of speech in seconds, from pause timing.
   * Optional: absent on sessions recorded before the progression system.
   */
  cleanSpeechSec?: number;
  vocab: {
    unique: number;
    ttr: number;
    avgWordLen: number;
  };
  /**
   * Loudness/projection, captured from the mic level meter. Optional: absent
   * when the level meter never ran (typed fallback, denied mic). `mean`/`std`
   * are 0–1 RMS; `score` is the deterministic 0–100 projection score.
   */
  volume?: { mean: number; std: number; score: number } | null;
  /**
   * Hedge words ("I think", "maybe", …) counted on-device; they temper the
   * AI's Confidence score. Optional: absent on sessions recorded before the
   * progression system existed.
   */
  hedges?: { total: number; perMin: number; counts: Record<string, number> };
  /** Deterministic 0–100 scores computed client-side. */
  paceScore: number;
  fillerScore: number;
  fluencyScore: number;
}

/* ————— The eight scored metrics (progression system) ————— */

export const METRIC_KEYS = [
  "clarity",
  "confidence",
  "structure",
  "pace",
  "fluency",
  "wordPower",
  "conciseness",
  "engagement",
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];

/** 0–100 per metric; null when it couldn't be scored (offline: only pace/fluency). */
export type EightScores = Record<MetricKey, number | null>;

/** Structured coaching report returned by /api/feedback (see server/coach.ts). */
export interface AiReport {
  scores: Record<MetricKey, number>;
  /** Exactly one coach sentence per metric. */
  oneLiners: Record<MetricKey, string>;
  /** 2–4 things the speaker did well, each with a brief supporting detail. */
  whatWorked?: { point: string; detail: string }[];
  /** 4–6 impactful words/phrases actually used, each with a note on where it worked. */
  strongWords?: { word: string; note: string }[];
  /** Exactly 3 improvements, ranked by impact: one-sentence issue + concrete step. */
  improvements?: { issue: string; action: string }[];
  /** Rhetorical/stylistic techniques found in the transcript, with effect notes. */
  stylisticDevices?: { device: string; note: string }[];
  /** @deprecated pre-redesign field; present only on old stored reports. */
  strongestLine?: { quote: string; why: string };
  tighten: { quote: string; rewrite: string };
  /** @deprecated pre-redesign field; present only on old stored reports. */
  powerWords?: { word: string; count: number }[];
  /** @deprecated pre-redesign field; present only on old stored reports. */
  weakWords?: { word: string; count: number }[];
  /** Words the transcription likely garbled — proxy for articulation trouble. */
  hardToCatch: string[];
  cleanSpeechSeconds: number;
  articulation: number;
  confidenceLabel: string;
  confidenceNote: string;
  /** AI's guess; the client always prefers the on-device series from segments. */
  wpmOverTime: number[];
}

/** Per-speech progression record, written once analysis is complete. */
export interface SpeechProgress {
  scores: EightScores;
  /** round(mean of the 8); null while analysis is pending (offline). */
  overallScore: number | null;
  xpEarned: number;
  wordOfDayUsed: boolean;
  wpm: number;
  /** True until a full AI analysis completes — no partial XP is awarded. */
  xpPending: boolean;
}

export interface AiRewrite {
  original: string;
  better: string;
  why: string;
}

export interface AiTip {
  title: string;
  detail: string;
}

/** One AI-judged rhetorical dimension: a score, an observation, and a fix. */
export interface AiCategory {
  score: number;
  note: string;
  /** One concrete, actionable improvement for next time. */
  improve: string;
}

export interface AiFeedback {
  eloquence: AiCategory;
  structure: AiCategory;
  stylistic: AiCategory;
  comprehensiveness: AiCategory;
  logic: AiCategory;
  phrasing: AiCategory & { rewrites: AiRewrite[] };
  professionalism: AiCategory & { flags: string[] };
  paceNote: string;
  fillerNote: string;
  fluencyNote: string;
  summary: string;
  strengths: string[];
  tips: AiTip[];
  wordOfDay?: { used: boolean; comment: string };
  source: "claude" | "offline";
}

export interface Scores {
  pace: number;
  volume: number | null;
  fillers: number;
  fluency: number;
  eloquence: number | null;
  structure: number | null;
  stylistic: number | null;
  comprehensiveness: number | null;
  logic: number | null;
  phrasing: number | null;
  professionalism: number | null;
  overall: number;
}

export interface Session {
  id?: number;
  kind: "daily" | "scenario";
  refId: string;
  day?: number;
  lang: Lang;
  /** Local calendar date yyyy-mm-dd (streak + daily-path anchor). */
  dateISO: string;
  startedAt: number;
  durationSec: number;
  transcript: string;
  segments: SpeechSegment[];
  metrics: Metrics;
  ai: AiFeedback | null;
  scores: Scores;
  /** Structured 8-metric coaching report (null until analysis completes). */
  report?: AiReport | null;
  /** Progression record (absent on sessions from before the XP system). */
  progress?: SpeechProgress;
  promptTitle: string;
  promptText: string;
  wordOfDay?: string;
}

/**
 * One earned "use the daily word in a sentence" bonus. Keyed by local date —
 * there is exactly one daily word per day, so the key doubles as the
 * once-per-word guard against resubmitting for more XP.
 */
export interface WordBonus {
  dateISO: string;
  day: number;
  word: string;
  xp: number;
  awardedAt: number;
}

export interface Challenge {
  day: number;
  title: Bilingual;
  prompt: Bilingual;
  /** What the coach is listening for today. */
  focus: Bilingual;
  difficulty: 1 | 2 | 3 | 4 | 5;
  targetSec: [number, number];
}

export type CategoryId =
  | "business"
  | "interview"
  | "storytelling"
  | "occasions"
  | "difficult"
  | "debate"
  | "persuasion"
  | "smalltalk"
  | "crisis"
  | "ted";

export interface Scenario {
  id: string;
  category: CategoryId;
  title: Bilingual;
  prompt: Bilingual;
  difficulty: 1 | 2 | 3;
  targetSec: [number, number];
}

export interface WordEntry {
  word: string;
  pos: string;
  pronunciation: string;
  definition: string;
  example: string;
}

function mean(xs: number[]): number {
  return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;
}

/**
 * The overall grade is the plain average of the seven headline dimensions the
 * user sees (pace, volume, eloquence, structure, stylistic devices,
 * comprehensiveness, logic). Deterministic delivery details (fillers, fluency)
 * and the AI's phrasing/professionalism notes stay as supporting sections and
 * don't sway the headline. Categories that couldn't be scored drop out of the
 * average rather than counting as zero.
 */
export function blendScores(m: Metrics, ai: AiFeedback | null): Scores {
  const volume = m.volume?.score ?? null;
  const base = {
    pace: m.paceScore,
    volume,
    fillers: m.fillerScore,
    fluency: m.fluencyScore,
  };

  if (!ai || ai.source === "offline") {
    // Without AI coaching, grade on the deterministic delivery signals only.
    const overall = mean([m.paceScore, m.fillerScore, m.fluencyScore, ...(volume !== null ? [volume] : [])]);
    return {
      ...base,
      eloquence: null,
      structure: null,
      stylistic: null,
      comprehensiveness: null,
      logic: null,
      phrasing: null,
      professionalism: null,
      overall,
    };
  }

  const headline = [
    m.paceScore,
    ...(volume !== null ? [volume] : []),
    ai.eloquence.score,
    ai.structure.score,
    ai.stylistic.score,
    ai.comprehensiveness.score,
    ai.logic.score,
  ];
  return {
    ...base,
    eloquence: ai.eloquence.score,
    structure: ai.structure.score,
    stylistic: ai.stylistic.score,
    comprehensiveness: ai.comprehensiveness.score,
    logic: ai.logic.score,
    phrasing: ai.phrasing.score,
    professionalism: ai.professionalism.score,
    overall: mean(headline),
  };
}
