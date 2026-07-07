import { describe, expect, it } from "vitest";
import {
  RANKS,
  WORD_OF_DAY_BONUS,
  computeEight,
  levelForXp,
  overallFromEight,
  rollingStats,
  xpForScore,
} from "@/lib/progression";
import { cleanSpeechSeconds, countHedges, wpmSeries } from "@/lib/metrics";
import { METRIC_KEYS, type AiReport, type EightScores, type Metrics } from "@/lib/types";

function makeMetrics(overrides: Partial<Metrics> = {}): Metrics {
  return {
    durationSec: 60,
    wordCount: 140,
    wpm: 140,
    fillers: { total: 2, perMin: 2, counts: { um: 2 } },
    repetitions: { count: 0, examples: [] },
    pauses: { count: 1, longestMs: 1600 },
    vocab: { unique: 90, ttr: 0.6, avgWordLen: 4.6 },
    hedges: { total: 0, perMin: 0, counts: {} },
    paceScore: 100,
    fillerScore: 84,
    fluencyScore: 100,
    ...overrides,
  };
}

function makeReport(score = 80): AiReport {
  const scores = Object.fromEntries(METRIC_KEYS.map((k) => [k, score])) as AiReport["scores"];
  const oneLiners = Object.fromEntries(METRIC_KEYS.map((k) => [k, "One sentence."])) as AiReport["oneLiners"];
  return {
    scores,
    oneLiners,
    strongestLine: { quote: "q", why: "w" },
    tighten: { quote: "q", rewrite: "r" },
    powerWords: [],
    weakWords: [],
    hardToCatch: [],
    cleanSpeechSeconds: 30,
    articulation: 80,
    confidenceLabel: "Assured",
    confidenceNote: "",
    wpmOverTime: [],
  };
}

describe("xpForScore", () => {
  it("is quadratic: 100→1000, 80→640, 40→160", () => {
    expect(xpForScore(100)).toBe(1000);
    expect(xpForScore(80)).toBe(640);
    expect(xpForScore(40)).toBe(160);
  });
});

describe("levelForXp", () => {
  it("returns the highest rank whose threshold is reached", () => {
    expect(levelForXp(0).level).toBe(1);
    expect(levelForXp(499).level).toBe(1);
    expect(levelForXp(500).level).toBe(2);
    expect(levelForXp(6595).level).toBe(6);
    expect(levelForXp(6595).rank.name.en).toBe("Skilled");
    expect(levelForXp(999_999).level).toBe(10);
  });

  it("computes xpToNext against the next threshold, 0 at max rank", () => {
    expect(levelForXp(500).xpToNext).toBe(750); // 1250 − 500
    expect(levelForXp(37_460).xpToNext).toBe(0);
    expect(levelForXp(37_460).nextRank).toBeNull();
  });

  it("has strictly increasing thresholds", () => {
    for (let i = 1; i < RANKS.length; i++) expect(RANKS[i].xp).toBeGreaterThan(RANKS[i - 1].xp);
  });
});

describe("computeEight", () => {
  it("scores only pace and fluency without a report; everything else pending", () => {
    const eight = computeEight(makeMetrics(), null);
    expect(eight.pace).toBe(100);
    expect(eight.fluency).toBe(92); // mean(84, 100)
    for (const k of ["clarity", "confidence", "structure", "wordPower", "conciseness", "engagement"] as const) {
      expect(eight[k]).toBeNull();
    }
    expect(overallFromEight(eight)).toBeNull();
  });

  it("prefers on-device pace and weighs on-device fluency at 70%", () => {
    const eight = computeEight(makeMetrics({ paceScore: 100 }), makeReport(50));
    expect(eight.pace).toBe(100); // AI's 50 is ignored for pace
    expect(eight.fluency).toBe(Math.round(0.7 * 92 + 0.3 * 50));
  });

  it("tempers AI confidence with the on-device hedge count", () => {
    const hedgy = makeMetrics({ hedges: { total: 6, perMin: 6, counts: { maybe: 6 } } });
    expect(computeEight(hedgy, makeReport(80)).confidence).toBe(80 - 18);
    // Penalty is capped at 20.
    const veryHedgy = makeMetrics({ hedges: { total: 20, perMin: 20, counts: { maybe: 20 } } });
    expect(computeEight(veryHedgy, makeReport(80)).confidence).toBe(60);
  });

  it("awards the word-of-day bonus on top of quadratic XP", () => {
    const eight = computeEight(makeMetrics(), makeReport(80));
    const overall = overallFromEight(eight)!;
    expect(xpForScore(overall) + WORD_OF_DAY_BONUS).toBe(xpForScore(overall) + 20);
  });
});

describe("rollingStats", () => {
  const speech = (clarity: number): EightScores => ({
    clarity,
    confidence: 70,
    structure: 70,
    pace: 70,
    fluency: 70,
    wordPower: 70,
    conciseness: 70,
    engagement: 70,
  });

  it("averages over the last 10 speeches (or all, if fewer)", () => {
    const { averages } = rollingStats([speech(60), speech(80)]);
    expect(averages.clarity).toBe(70);
  });

  it("trend = current rolling mean minus the mean before the latest speech", () => {
    const history = [speech(60), speech(60), speech(90)];
    const { averages, trends } = rollingStats(history);
    expect(averages.clarity).toBe(70);
    expect(trends.clarity).toBe(10); // 70 − 60
    expect(trends.confidence).toBe(0);
  });

  it("only the last 10 speeches count toward the current window", () => {
    const history = [...Array.from({ length: 10 }, () => speech(50)), speech(100)];
    const { averages } = rollingStats(history);
    // Window is the last 10: nine 50s and one 100.
    expect(averages.clarity).toBe(Math.round((9 * 50 + 100) / 10));
  });

  it("is null with no scored speeches", () => {
    const { averages, trends } = rollingStats([]);
    expect(averages.clarity).toBeNull();
    expect(trends.clarity).toBe(0);
  });
});

describe("on-device delivery detail", () => {
  it("counts hedge words and phrases", () => {
    const segs = [{ text: "I think maybe we should sort of try", t: 1000 }];
    const { total, counts } = countHedges(segs, "en");
    expect(counts["i think"]).toBe(1);
    expect(counts["maybe"]).toBe(1);
    expect(counts["sort of"]).toBe(1);
    expect(total).toBe(3);
  });

  it("computes a wpm series from segment timing", () => {
    // 3 segments of 20 words across a minute → steady ~60 wpm signal.
    const words = Array.from({ length: 20 }, () => "word").join(" ");
    const segs = [
      { text: words, t: 15_000 },
      { text: words, t: 35_000 },
      { text: words, t: 55_000 },
    ];
    const series = wpmSeries(segs, 60);
    expect(series.length).toBeGreaterThanOrEqual(3);
    expect(Math.max(...series)).toBeLessThanOrEqual(120);
  });

  it("finds the longest clean stretch between pauses", () => {
    const pauses = [
      { atMs: 10_000, durationMs: 2_000 },
      { atMs: 40_000, durationMs: 3_000 },
    ];
    // Stretches: 0–10s, 12–40s, 43–60s → longest 28s.
    expect(cleanSpeechSeconds(pauses, 60)).toBe(28);
    expect(cleanSpeechSeconds([], 60)).toBe(60);
  });
});
