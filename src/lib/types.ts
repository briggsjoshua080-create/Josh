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
  /** Deterministic 0–100 scores computed client-side. */
  paceScore: number;
  fillerScore: number;
  fluencyScore: number;
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
  promptTitle: string;
  promptText: string;
  wordOfDay?: string;
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
