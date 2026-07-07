import { describe, expect, it } from "vitest";
import { blendScores, type AiCategory, type AiFeedback, type Metrics } from "@/lib/types";
import { deliveryCoaching } from "@/lib/feedback";
import { coachingCopy } from "@/lib/strings";

function makeMetrics(overrides: Partial<Metrics> = {}): Metrics {
  return {
    durationSec: 60,
    wordCount: 180,
    wpm: 180,
    fillers: { total: 14, perMin: 14, counts: { um: 10, like: 4 } },
    repetitions: { count: 2, examples: ["the the"] },
    pauses: { count: 3, longestMs: 1200 },
    vocab: { unique: 90, ttr: 0.5, avgWordLen: 4.6 },
    paceScore: 70,
    fillerScore: 60,
    fluencyScore: 80,
    ...overrides,
  };
}

function cat(score: number): AiCategory {
  return { score, note: "note", improve: "improve" };
}

function makeAi(overrides: Partial<AiFeedback> = {}): AiFeedback {
  return {
    eloquence: cat(70),
    structure: cat(80),
    stylistic: cat(60),
    comprehensiveness: cat(90),
    logic: cat(100),
    phrasing: { ...cat(10), rewrites: [] },
    professionalism: { ...cat(10), flags: [] },
    paceNote: "",
    fillerNote: "",
    fluencyNote: "",
    summary: "",
    strengths: [],
    tips: [],
    source: "claude",
    ...overrides,
  };
}

describe("blendScores", () => {
  it("averages only the deterministic delivery scores when there is no AI feedback", () => {
    const m = makeMetrics({ paceScore: 80, fillerScore: 90, fluencyScore: 70 });
    const scores = blendScores(m, null);

    // (80 + 90 + 70) / 3 — volume is unscored and must not drag the average down.
    expect(scores.overall).toBe(80);
    expect(scores.volume).toBeNull();
    expect(scores.eloquence).toBeNull();
    expect(scores.structure).toBeNull();
    expect(scores.stylistic).toBeNull();
    expect(scores.comprehensiveness).toBeNull();
    expect(scores.logic).toBeNull();
    expect(scores.phrasing).toBeNull();
    expect(scores.professionalism).toBeNull();
  });

  it("includes volume in the offline average when it was measured", () => {
    const m = makeMetrics({
      paceScore: 80,
      fillerScore: 90,
      fluencyScore: 70,
      volume: { mean: 0.3, std: 0.05, score: 100 },
    });
    // (80 + 90 + 70 + 100) / 4
    expect(blendScores(m, null).overall).toBe(85);
  });

  it("averages the seven headline dimensions with AI feedback, dropping unscored volume", () => {
    const m = makeMetrics({ paceScore: 80 });
    const scores = blendScores(m, makeAi());

    // pace 80 + eloquence 70 + structure 80 + stylistic 60 + comprehensiveness 90
    // + logic 100 = 480 / 6 = 80. Volume (unscored) drops out; phrasing and
    // professionalism (both 10) are supporting sections and must not sway it.
    expect(scores.overall).toBe(80);
    expect(scores.volume).toBeNull();
    expect(scores.phrasing).toBe(10);
    expect(scores.professionalism).toBe(10);
  });

  it("treats offline AI feedback like no AI feedback for the overall grade", () => {
    const m = makeMetrics({ paceScore: 80, fillerScore: 90, fluencyScore: 70 });
    const scores = blendScores(m, makeAi({ source: "offline" }));
    expect(scores.overall).toBe(80);
    expect(scores.eloquence).toBeNull();
  });
});

describe("deliveryCoaching", () => {
  // Sample session: 180 wpm (too fast for English), heavy fillers (~8%).
  const fast = makeMetrics({ wpm: 180, fillerScore: 60, fluencyScore: 80 });

  it("returns all required fields with actionable, non-empty improve lines", () => {
    const out = deliveryCoaching(fast, "en");

    expect(out.pace.improve).toBeTruthy();
    expect(out.fillers.improve).toBeTruthy();
    expect(out.fluency.improve).toBeTruthy();
    expect(out.volume).toBeNull(); // volume was not measured

    // Sanity companion check from the same session: the blended score is valid.
    expect(blendScores(fast, null).overall).toBeGreaterThanOrEqual(0);
  });

  it("picks the matching branch copy per language", () => {
    const en = deliveryCoaching(fast, "en", 0);
    const de = deliveryCoaching(fast, "de", 0);

    expect(coachingCopy.feedbackPaceFastImprove.en).toContain(en.pace.improve);
    expect(coachingCopy.feedbackFillersHighImprove.en).toContain(en.fillers.improve);
    expect(coachingCopy.feedbackFluencyLowImprove.en).toContain(en.fluency.improve);
    expect(coachingCopy.feedbackPaceFastImprove.de).toContain(de.pace.improve);
    expect(en.pace.improve).not.toBe(de.pace.improve);
  });

  it("rotates through distinct phrasings as the variant seed changes", () => {
    const lines = new Set(
      [0, 1, 2].map((seed) => deliveryCoaching(fast, "en", seed).pace.improve),
    );
    expect(lines.size).toBe(coachingCopy.feedbackPaceFastImprove.en.length);
  });

  it("is stable for the same session without an explicit seed", () => {
    expect(deliveryCoaching(fast, "en").pace.improve).toBe(deliveryCoaching(fast, "en").pace.improve);
  });

  it("covers the slow and in-band pace branches", () => {
    const slow = deliveryCoaching(makeMetrics({ wpm: 90 }), "en", 0);
    const good = deliveryCoaching(makeMetrics({ wpm: 140 }), "en", 0);
    expect(coachingCopy.feedbackPaceSlowImprove.en).toContain(slow.pace.improve);
    expect(coachingCopy.feedbackPaceGoodImprove.en).toContain(good.pace.improve);
  });

  it("returns volume coaching when the level meter ran", () => {
    const out = deliveryCoaching(
      makeMetrics({ volume: { mean: 0.05, std: 0.01, score: 30 } }),
      "en",
    );
    expect(out.volume).not.toBeNull();
    expect(out.volume?.note).toBeTruthy();
    expect(out.volume?.improve).toBeTruthy();
  });
});
