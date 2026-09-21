import type { Scenario, WordEntry, Lang } from "./types";
import { SCENARIOS } from "@/data/scenarios";
import { WORDS_EN, WORDS_DE } from "@/data/words";

/**
 * The candidate pool for a given account-age day (the count of daily-practice
 * days logged, from dailyPathState()). Impromptu/debate prompts only through
 * day 20, with the difficulty ceiling rising each week; day 21+ opens up to
 * the entire scenario library, any category, any difficulty.
 */
export function dailyPoolFor(accountDay: number): Scenario[] {
  // A NaN day (a malformed ?day= in the URL) would fail every <= comparison and
  // fall through to the full library, handing a day-2 beginner a difficulty-3
  // crisis-comms prompt — and that pick then persists for the whole day.
  const day = Number.isFinite(accountDay) ? Math.max(1, Math.floor(accountDay)) : 1;
  const warmup = SCENARIOS.filter((s) => s.category === "debate" || s.id.startsWith("imp-"));
  if (day <= 6) return warmup.filter((s) => s.difficulty === 1);
  if (day <= 13) return warmup.filter((s) => s.difficulty <= 2);
  if (day <= 20) return warmup;
  return SCENARIOS;
}

/**
 * Random pick from `pool`, excluding anything in `recentIds` unless that
 * would empty the pool out — same fallback rule as pickWordIndex below.
 * Structurally parallel to it, but keyed on scenario ids rather than a flat
 * integer range, since the candidate pool's contents change by tier day to
 * day, not just its size.
 */
export function pickScenario(
  pool: Scenario[],
  recentIds: readonly string[] = [],
  rng: () => number = Math.random,
): Scenario {
  const blocked = new Set(recentIds);
  const eligible = pool.filter((s) => !blocked.has(s.id));
  const from = eligible.length > 0 ? eligible : pool;
  // An empty pool would index [-1] and return undefined, which then throws on
  // `.id` inside the caller's transaction and hangs the Today screen on its
  // skeleton. Unreachable with today's data; guarded because it is guarded only
  // by the data, and a future retag could empty a tier.
  if (from.length === 0) {
    throw new Error("pickScenario: empty scenario pool");
  }
  return from[Math.min(from.length - 1, Math.floor(rng() * from.length))];
}

/** How far back a scenario is held out of the random daily draw once shown. */
export const RECENT_DAILY_MEMORY = 14;

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

