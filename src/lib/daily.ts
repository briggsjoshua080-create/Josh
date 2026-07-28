import type { Challenge, WordEntry, Lang } from "./types";
import { CHALLENGES, ADVANCED_ROTATION } from "@/data/challenges";
import { WORDS_EN, WORDS_DE } from "@/data/words";

/**
 * The core program is 66 days; the path continues indefinitely afterwards.
 * Days 67+ draw deterministically from an advanced rotation with an
 * escalating framing, so "Day 67, 68, …" always resolves to real content.
 */
export function challengeForDay(day: number): Challenge {
  if (day <= CHALLENGES.length) return CHALLENGES[day - 1];
  const idx = (day - CHALLENGES.length - 1) % ADVANCED_ROTATION.length;
  const base = ADVANCED_ROTATION[idx];
  return { ...base, day };
}

/** How many word slots there are. EN and DE are index-aligned translations. */
export const DAILY_WORD_COUNT = WORDS_EN.length;

/**
 * How many previous days' words are held back from the draw. Well under the
 * list length, so there is always a wide pool left to choose from.
 */
export const RECENT_WORD_MEMORY = 14;

/**
 * Pick a word slot at random, skipping anything drawn in the last
 * RECENT_WORD_MEMORY days so the same word can't land twice in a fortnight.
 * If callers ever pass more recent indices than there are words, the block
 * list is ignored rather than leaving nothing to pick from.
 *
 * Pure and injectable — the persistence and the date handling live in db.ts.
 */
export function pickWordIndex(
  listLength: number,
  recent: readonly number[] = [],
  rng: () => number = Math.random,
): number {
  const blocked = new Set(recent);
  const pool: number[] = [];
  for (let i = 0; i < listLength; i++) if (!blocked.has(i)) pool.push(i);
  const from = pool.length > 0 ? pool : Array.from({ length: listLength }, (_, i) => i);
  return from[Math.min(from.length - 1, Math.floor(rng() * from.length))];
}

/** Resolve a stored word slot to the entry for the active language. */
export function wordAtIndex(index: number, lang: Lang): WordEntry {
  const list = lang === "de" ? WORDS_DE : WORDS_EN;
  return list[((index % list.length) + list.length) % list.length];
}

export function isBeyondCore(day: number): boolean {
  return day > CHALLENGES.length;
}
