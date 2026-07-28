import { describe, it, expect } from "vitest";
import {
  DAILY_WORD_COUNT,
  RECENT_WORD_MEMORY,
  pickWordIndex,
  wordAtIndex,
  challengeForDay,
} from "@/lib/daily";

/** Deterministic stand-in for Math.random, cycling through fixed draws. */
function seededRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("pickWordIndex", () => {
  it("stays inside the list", () => {
    for (const r of [0, 0.25, 0.5, 0.999999]) {
      const i = pickWordIndex(DAILY_WORD_COUNT, [], () => r);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(DAILY_WORD_COUNT);
    }
  });

  it("clamps an rng that returns exactly 1", () => {
    expect(pickWordIndex(10, [], () => 1)).toBe(9);
  });

  it("never returns a recently used index", () => {
    const recent = [0, 1, 2, 3, 4];
    for (let r = 0; r < 1; r += 0.01) {
      expect(recent).not.toContain(pickWordIndex(10, recent, () => r));
    }
  });

  it("draws from the whole list once the block list covers everything", () => {
    const all = Array.from({ length: 5 }, (_, i) => i);
    const i = pickWordIndex(5, all, () => 0.5);
    expect(i).toBeGreaterThanOrEqual(0);
    expect(i).toBeLessThan(5);
  });

  it("is not sequential — consecutive draws jump around the list", () => {
    // Simulate a fortnight, feeding each pick back in as recent history.
    const rng = seededRng([0.81, 0.14, 0.62, 0.03, 0.47, 0.95, 0.29, 0.71]);
    const picks: number[] = [];
    for (let day = 0; day < 8; day++) {
      picks.push(pickWordIndex(DAILY_WORD_COUNT, picks.slice(-RECENT_WORD_MEMORY), rng));
    }
    // A sequential index would produce n, n+1, n+2… — assert it does not.
    const sequential = picks.every((p, i) => i === 0 || p === picks[i - 1] + 1);
    expect(sequential).toBe(false);
    expect(new Set(picks).size).toBe(picks.length);
  });

  it("keeps a fortnight free of repeats", () => {
    const rng = seededRng([0.11, 0.37, 0.83, 0.05, 0.66, 0.22, 0.9, 0.44, 0.58, 0.73]);
    const picks: number[] = [];
    for (let day = 0; day < RECENT_WORD_MEMORY + 1; day++) {
      picks.push(pickWordIndex(DAILY_WORD_COUNT, picks.slice(-RECENT_WORD_MEMORY), rng));
    }
    const window = picks.slice(-RECENT_WORD_MEMORY - 1);
    expect(new Set(window).size).toBe(window.length);
  });
});

describe("wordAtIndex", () => {
  it("resolves every slot in both languages", () => {
    for (let i = 0; i < DAILY_WORD_COUNT; i++) {
      expect(wordAtIndex(i, "en").word).toBeTruthy();
      expect(wordAtIndex(i, "de").word).toBeTruthy();
    }
  });

  it("wraps out-of-range indices instead of returning undefined", () => {
    expect(wordAtIndex(DAILY_WORD_COUNT, "en")).toEqual(wordAtIndex(0, "en"));
    expect(wordAtIndex(-1, "en").word).toBeTruthy();
  });
});

describe("challengeForDay", () => {
  it("still walks the path in order — only the word is randomised", () => {
    expect(challengeForDay(1).day).toBe(1);
    expect(challengeForDay(2).day).toBe(2);
    expect(challengeForDay(66).day).toBe(66);
    expect(challengeForDay(67).day).toBe(67);
  });
});
