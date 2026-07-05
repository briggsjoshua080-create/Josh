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

export interface AiFeedback {
  eloquence: { score: number; note: string };
  phrasing: { score: number; note: string; rewrites: AiRewrite[] };
  professionalism: { score: number; note: string; flags: string[] };
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
  fillers: number;
  fluency: number;
  eloquence: number | null;
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

/** Weighted blend; AI categories drop out gracefully when offline. */
export function blendScores(m: Metrics, ai: AiFeedback | null): Scores {
  const det = { pace: m.paceScore, fillers: m.fillerScore, fluency: m.fluencyScore };
  if (!ai || ai.source === "offline") {
    const overall = Math.round(det.pace * 0.35 + det.fillers * 0.4 + det.fluency * 0.25);
    return { ...det, eloquence: null, phrasing: null, professionalism: null, overall };
  }
  const overall = Math.round(
    det.pace * 0.15 +
      det.fillers * 0.2 +
      det.fluency * 0.15 +
      ai.eloquence.score * 0.2 +
      ai.phrasing.score * 0.2 +
      ai.professionalism.score * 0.1,
  );
  return {
    ...det,
    eloquence: ai.eloquence.score,
    phrasing: ai.phrasing.score,
    professionalism: ai.professionalism.score,
    overall,
  };
}
