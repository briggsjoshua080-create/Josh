import type { AiReport, EightScores, Metrics, MetricKey, Session } from "./types";
import { METRIC_KEYS } from "./types";

/**
 * The progression system: XP, ranks, and the rolling 8-metric stats.
 * The rank table lives here — tune thresholds and names in one place.
 */

export interface Rank {
  level: number;
  name: { en: string; de: string };
  /** Cumulative XP required to REACH this rank. */
  xp: number;
}

export const RANKS: readonly Rank[] = [
  { level: 1, name: { en: "Finding Your Voice", de: "Stimme finden" }, xp: 0 },
  { level: 2, name: { en: "Beginner", de: "Anfänger" }, xp: 500 },
  { level: 3, name: { en: "Developing", de: "Im Aufbau" }, xp: 1_250 },
  { level: 4, name: { en: "Competent", de: "Solide" }, xp: 2_375 },
  { level: 5, name: { en: "Proficient", de: "Sicher" }, xp: 4_065 },
  { level: 6, name: { en: "Skilled", de: "Gekonnt" }, xp: 6_595 },
  { level: 7, name: { en: "Polished", de: "Geschliffen" }, xp: 10_395 },
  { level: 8, name: { en: "Compelling", de: "Mitreißend" }, xp: 16_095 },
  { level: 9, name: { en: "Masterful", de: "Meisterhaft" }, xp: 24_640 },
  { level: 10, name: { en: "Orator", de: "Orator" }, xp: 37_460 },
] as const;

export const WORD_OF_DAY_BONUS = 20;

/** Per-speech XP: quadratic so great speeches feel earned (100→1000, 80→640, 40→160). */
export function xpForScore(overallScore: number): number {
  return Math.round((overallScore * overallScore) / 10);
}

export interface LevelState {
  level: number;
  rank: Rank;
  nextRank: Rank | null;
  /** XP still missing to the next rank; 0 at max rank. */
  xpToNext: number;
  /** 0–1 progress through the current rank's span (1 at max rank). */
  progress: number;
}

export function levelForXp(cumulativeXp: number): LevelState {
  const xp = Math.max(0, cumulativeXp);
  let rank = RANKS[0];
  for (const r of RANKS) if (xp >= r.xp) rank = r;
  const nextRank = RANKS.find((r) => r.level === rank.level + 1) ?? null;
  const xpToNext = nextRank ? nextRank.xp - xp : 0;
  const span = nextRank ? nextRank.xp - rank.xp : 1;
  const progress = nextRank ? Math.min(1, (xp - rank.xp) / span) : 1;
  return { level: rank.level, rank, nextRank, xpToNext, progress };
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Blend the 8 metric scores from on-device metrics + the AI report.
 * On-device numbers win for Pace and weigh heaviest for Fluency; the
 * on-device hedge count tempers the AI's Confidence. Without a report only
 * Pace and Fluency can be scored — everything else stays null (pending).
 */
export function computeEight(m: Metrics, report: AiReport | null): EightScores {
  const pace = m.paceScore;
  const fluencyOnDevice = Math.round((m.fillerScore + m.fluencyScore) / 2);
  const fluency = report
    ? clamp(0.7 * fluencyOnDevice + 0.3 * report.scores.fluency)
    : fluencyOnDevice;

  if (!report) {
    return {
      clarity: null,
      confidence: null,
      structure: null,
      pace,
      fluency,
      wordPower: null,
      conciseness: null,
      engagement: null,
    };
  }

  const hedgePenalty = Math.min(20, Math.round((m.hedges?.perMin ?? 0) * 3));
  return {
    clarity: clamp(report.scores.clarity),
    confidence: clamp(report.scores.confidence - hedgePenalty),
    structure: clamp(report.scores.structure),
    pace,
    fluency,
    wordPower: clamp(report.scores.wordPower),
    conciseness: clamp(report.scores.conciseness),
    engagement: clamp(report.scores.engagement),
  };
}

/** round(mean of the 8); null unless every metric was scored. */
export function overallFromEight(scores: EightScores): number | null {
  const values = METRIC_KEYS.map((k) => scores[k]);
  if (values.some((v) => v === null)) return null;
  return Math.round((values as number[]).reduce((a, b) => a + b, 0) / values.length);
}

export interface RollingStats {
  /** Rolling mean per metric over the last 10 scored speeches (or all, if fewer). */
  averages: Record<MetricKey, number | null>;
  /** Current rolling mean minus the previous one, rounded — drives the ↑/↓ arrows. */
  trends: Record<MetricKey, number>;
}

const ROLLING_WINDOW = 10;

function windowMean(history: EightScores[], key: MetricKey): number | null {
  const values = history
    .slice(-ROLLING_WINDOW)
    .map((h) => h[key])
    .filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/** `history` is fully-scored speeches, oldest → newest. */
export function rollingStats(history: EightScores[]): RollingStats {
  const averages = {} as Record<MetricKey, number | null>;
  const trends = {} as Record<MetricKey, number>;
  const previous = history.slice(0, -1);
  for (const key of METRIC_KEYS) {
    const now = windowMean(history, key);
    const before = windowMean(previous, key);
    averages[key] = now;
    trends[key] = now !== null && before !== null ? now - before : 0;
  }
  return { averages, trends };
}

/** Aggregate progression state, recomputed from sessions (idempotent, no drift). */
export interface ProgressState {
  id: "main";
  cumulativeXp: number;
  level: number;
  statAverages: Record<MetricKey, number | null>;
  statTrends: Record<MetricKey, number>;
  updatedAt: number;
}

export function progressFromSessions(sessions: Session[]): ProgressState {
  const scored = sessions
    .filter((s) => s.progress && !s.progress.xpPending)
    .sort((a, b) => a.startedAt - b.startedAt);
  const cumulativeXp = scored.reduce((sum, s) => sum + (s.progress?.xpEarned ?? 0), 0);
  const { averages, trends } = rollingStats(scored.map((s) => s.progress!.scores));
  return {
    id: "main",
    cumulativeXp,
    level: levelForXp(cumulativeXp).level,
    statAverages: averages,
    statTrends: trends,
    updatedAt: Date.now(),
  };
}
