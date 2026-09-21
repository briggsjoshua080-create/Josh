import { describe, it, expect } from "vitest";
import { mergeLegs, type Leg } from "@/lib/legs";

const leg = (over: Partial<Leg> = {}): Leg => ({
  segments: [],
  pauses: [],
  durationSec: 0,
  volume: null,
  pausedAfterMs: 0,
  ...over,
});

describe("mergeLegs", () => {
  it("passes a single leg through untouched", () => {
    const only = leg({
      segments: [{ text: "hello there", t: 500 }],
      pauses: [{ atMs: 1000, durationMs: 2000 }],
      durationSec: 30,
    });
    const merged = mergeLegs([only]);
    expect(merged.segments).toEqual([{ text: "hello there", t: 500 }]);
    expect(merged.pauses).toEqual([{ atMs: 1000, durationMs: 2000 }]);
    expect(merged.durationSec).toBe(30);
  });

  it("offsets later legs' timestamps past the earlier speech AND the pause between them", () => {
    const merged = mergeLegs([
      leg({ segments: [{ text: "first", t: 1000 }], durationSec: 10, pausedAfterMs: 5000 }),
      leg({ segments: [{ text: "second", t: 2000 }], durationSec: 10 }),
    ]);
    // 10s of speech + 5s paused = second leg starts at 15000ms.
    expect(merged.segments).toEqual([
      { text: "first", t: 1000 },
      { text: "second", t: 17000 },
    ]);
  });

  it("counts paused time toward duration, so pausing cannot inflate pace", () => {
    const spoken = mergeLegs([leg({ durationSec: 40, pausedAfterMs: 30_000 }), leg({ durationSec: 40 })]);
    // 40 + 40 speaking, plus 30s paused — identical to thinking on-mic.
    expect(spoken.durationSec).toBe(110);
  });

  it("records a long pause between legs as a real pause event", () => {
    const merged = mergeLegs([
      leg({ durationSec: 10, pausedAfterMs: 30_000 }),
      leg({ durationSec: 10 }),
    ]);
    expect(merged.pauses).toEqual([{ atMs: 10_000, durationMs: 30_000 }]);
  });

  it("ignores a pause too short to count, exactly as on-mic silence is ignored", () => {
    const merged = mergeLegs([leg({ durationSec: 10, pausedAfterMs: 400 }), leg({ durationSec: 10 })]);
    expect(merged.pauses).toEqual([]);
    // Still part of the elapsed recording, though.
    expect(merged.durationSec).toBeCloseTo(20.4, 5);
  });

  it("pools volume across legs by sample count rather than averaging the means", () => {
    const merged = mergeLegs([
      leg({ durationSec: 10, volume: { mean: 0.2, std: 0, count: 900 } }),
      leg({ durationSec: 10, volume: { mean: 0.4, std: 0, count: 100 } }),
    ]);
    // Weighted by count: (0.2*900 + 0.4*100) / 1000 = 0.22, not the naive 0.3.
    expect(merged.volume?.mean).toBeCloseTo(0.22, 3);
    // Spread between the two leg means is real variance, not zero.
    expect(merged.volume!.std).toBeGreaterThan(0);
  });

  it("reports no volume when no leg measured any", () => {
    expect(mergeLegs([leg({ durationSec: 5 })]).volume).toBeNull();
  });
});
