import { paceScore, volumeScore } from "./analysis";

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

/**
 * Offline volume analysis, sampled from the Web Audio AnalyserNode during
 * recording. `avg` and `dynamicRange` are 0–1 (fractions of the meter's
 * full scale); the API never sees any of this — it's computed on-device.
 */
export interface VolumeStats {
  /** Mean voiced level, 0–1. */
  avg: number;
  /** Std-dev of voiced level, 0–1 — low = monotone, healthy = dynamic. */
  dynamicRange: number;
  /** Number of voiced samples the stats were computed from. */
  samples: number;
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
  /** Offline volume analysis; absent when the mic level meter never started. */
  volume?: VolumeStats;
}

/** The uniform score card every category (offline or API) is rendered from. */
export interface CategoryFeedback {
  /** 0–100. */
  score: number;
  /** One or two sentences reading what happened. */
  note: string;
  /** One concrete thing to change next time. */
  improve: string;
}

/** The five text-only categories the Anthropic API judges from the transcript. */
export interface ContentFeedback {
  eloquence: CategoryFeedback;
  structure: CategoryFeedback;
  style: CategoryFeedback;
  comprehensiveness: CategoryFeedback;
  logic: CategoryFeedback;
  summary: string;
}

/**
 * The API-derived half of the report. `source` is "claude" when the API
 * returned usable JSON, and "offline" when it failed or was unreachable — in
 * which case the five category scores are placeholders and the results screen
 * shows an error state for them (pace/volume still render, they're offline).
 */
export interface AiFeedback extends ContentFeedback {
  source: "claude" | "offline";
}

/** The five API category ids, in display order. */
export const CONTENT_CATEGORIES = [
  "eloquence",
  "structure",
  "style",
  "comprehensiveness",
  "logic",
] as const;
export type ContentCategoryId = (typeof CONTENT_CATEGORIES)[number];

/** All seven category ids, in display order (offline pace/volume first). */
export const ALL_CATEGORIES = ["pace", "volume", ...CONTENT_CATEGORIES] as const;
export type CategoryId7 = (typeof ALL_CATEGORIES)[number];

export interface Scores {
  pace: number;
  volume: number | null;
  eloquence: number | null;
  structure: number | null;
  style: number | null;
  comprehensiveness: number | null;
  logic: number | null;
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

/**
 * Combine the offline pace/volume scores with the API content scores into the
 * seven-category set. `overall` is the plain average of every category that
 * actually has a score — so pace/volume alone still produce a number when the
 * API is offline or volume was never measured. Deliberately unweighted: the
 * results screen presents all seven as peers.
 */
export function blendScores(m: Metrics, ai: AiFeedback | null): Scores {
  const pace = paceScore(m.wpm);
  const volume = volumeScore(m.volume);
  const content =
    ai && ai.source === "claude"
      ? {
          eloquence: ai.eloquence.score,
          structure: ai.structure.score,
          style: ai.style.score,
          comprehensiveness: ai.comprehensiveness.score,
          logic: ai.logic.score,
        }
      : { eloquence: null, structure: null, style: null, comprehensiveness: null, logic: null };

  const present = [pace, volume, ...Object.values(content)].filter(
    (v): v is number => v !== null,
  );
  const overall = present.length
    ? Math.round(present.reduce((a, b) => a + b, 0) / present.length)
    : 0;

  return { pace, volume, ...content, overall };
}
