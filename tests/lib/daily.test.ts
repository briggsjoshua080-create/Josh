import { describe, it, expect } from "vitest";
import {
  DAILY_WORD_COUNT,
  RECENT_WORD_MEMORY,
  RECENT_DAILY_MEMORY,
  pickWordIndex,
  wordAtIndex,
  dailyPoolFor,
  pickScenario,
} from "@/lib/daily";
import { SCENARIOS } from "@/data/scenarios";

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

describe("dailyPoolFor", () => {
  it("restricts days 1-6 to difficulty-1 impromptu/debate prompts", () => {
    const pool = dailyPoolFor(6);
    expect(pool.length).toBeGreaterThan(0);
    for (const s of pool) {
      expect(s.difficulty).toBe(1);
      expect(s.category === "debate" || s.id.startsWith("imp-")).toBe(true);
    }
  });

  it("widens the difficulty ceiling at day 7 and day 14, same category filter", () => {
    const week2 = dailyPoolFor(10);
    const week3 = dailyPoolFor(17);
    for (const s of week2) {
      expect(s.difficulty).toBeLessThanOrEqual(2);
      expect(s.category === "debate" || s.id.startsWith("imp-")).toBe(true);
    }
    for (const s of week3) {
      expect(s.category === "debate" || s.id.startsWith("imp-")).toBe(true);
    }
    // Widening should only ever add candidates, never remove any.
    expect(week3.length).toBeGreaterThanOrEqual(week2.length);
  });

  it("opens up to the entire library from day 21", () => {
    const pool = dailyPoolFor(21);
    expect(pool).toBe(SCENARIOS);
    expect(pool.some((s) => s.category !== "debate" && !s.id.startsWith("imp-"))).toBe(true);
  });
});

describe("pickScenario", () => {
  it("stays inside the pool", () => {
    const pool = dailyPoolFor(1);
    for (const r of [0, 0.25, 0.5, 0.999999]) {
      const pick = pickScenario(pool, [], () => r);
      expect(pool).toContain(pick);
    }
  });

  it("never returns a recently used id unless that would empty the pool", () => {
    const pool = dailyPoolFor(21);
    const recent = pool.slice(0, 5).map((s) => s.id);
    for (let r = 0; r < 1; r += 0.05) {
      expect(recent).not.toContain(pickScenario(pool, recent, () => r).id);
    }
  });

  it("falls back to the full pool once the block list covers everything", () => {
    const pool = dailyPoolFor(1).slice(0, 3);
    const pick = pickScenario(pool, pool.map((s) => s.id), () => 0.5);
    expect(pool).toContain(pick);
  });

  it("RECENT_DAILY_MEMORY matches the word picker's convention", () => {
    expect(RECENT_DAILY_MEMORY).toBe(14);
  });
});
