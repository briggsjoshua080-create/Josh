import Dexie, { type EntityTable } from "dexie";
import type { DailyPick, DailyScenarioPick, Session } from "./types";
import { progressFromSessions, type ProgressState } from "./progression";
import {
  DAILY_WORD_COUNT,
  RECENT_WORD_MEMORY,
  RECENT_DAILY_MEMORY,
  pickWordIndex,
  pickScenario,
  dailyPoolFor,
} from "./daily";

/**
 * All user data lives here, on-device. No accounts, no server-side storage.
 * IndexedDB (not localStorage) because transcripts and history grow long.
 */
const db = new Dexie("orato") as Dexie & {
  sessions: EntityTable<Session, "id">;
  progress: EntityTable<ProgressState, "id">;
  dailyPicks: EntityTable<DailyPick, "dateISO">;
  dailyScenarioPicks: EntityTable<DailyScenarioPick, "dateISO">;
};

db.version(1).stores({
  sessions: "++id, dateISO, kind, startedAt, day",
});

// v2: aggregate progression state (cumulative XP, level, rolling stat
// averages/trends). Single row, keyed "main"; sessions table is unchanged.
db.version(2).stores({
  sessions: "++id, dateISO, kind, startedAt, day",
  progress: "id",
});

// v3: "use the daily word in a sentence" bonuses, one row per calendar day.
// Removed in v5 — the feature was retired.
db.version(3).stores({
  sessions: "++id, dateISO, kind, startedAt, day",
  progress: "id",
  wordBonuses: "dateISO",
});

// v4: the randomly drawn word of the day, one row per calendar day. Keyed by
// date rather than by day number so it is independent of the path/progress.
db.version(4).stores({
  sessions: "++id, dateISO, kind, startedAt, day",
  progress: "id",
  wordBonuses: "dateISO",
  dailyPicks: "dateISO",
});

// v5: drops wordBonuses (the "use it in a sentence" flow was removed) and
// adds dailyScenarioPicks — the randomly drawn daily-challenge scenario,
// one row per calendar day, mirroring dailyPicks' pattern.
db.version(5).stores({
  sessions: "++id, dateISO, kind, startedAt, day",
  progress: "id",
  wordBonuses: null,
  dailyPicks: "dateISO",
  dailyScenarioPicks: "dateISO",
});

export { db };

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function saveSession(s: Session): Promise<number> {
  return (await db.sessions.add(s)) as number;
}

export async function getSession(id: number): Promise<Session | undefined> {
  return db.sessions.get(id);
}

export async function allSessions(): Promise<Session[]> {
  return db.sessions.orderBy("startedAt").toArray();
}

/**
 * Recompute the aggregate progression state from all stored sessions and
 * persist it. Recompute-from-source keeps XP idempotent: re-running after a
 * retry or a re-opened report can never double-award.
 */
export async function recomputeProgress(): Promise<ProgressState> {
  const sessions = await db.sessions.toArray();
  const state = progressFromSessions(sessions);
  await db.progress.put(state);
  return state;
}

/**
 * The word slot drawn for a local date, drawing and persisting one the first
 * time that date is asked for. The row is what makes the pick stable: reopen
 * the app, switch language, reload — same word until the calendar date rolls
 * over, at which point a fresh draw happens.
 *
 * Runs inside a transaction so two components mounting at once can't each
 * draw a different word for the same day.
 */
export async function dailyWordIndex(dateISO = todayISO()): Promise<number> {
  return db.transaction("rw", db.dailyPicks, async () => {
    const existing = await db.dailyPicks.get(dateISO);
    if (existing) return existing.wordIndex;

    // The most recent picks before today, newest first — ISO dates sort
    // lexicographically, so key order is date order.
    const recent = await db.dailyPicks
      .where("dateISO")
      .below(dateISO)
      .reverse()
      .limit(RECENT_WORD_MEMORY)
      .toArray();

    const wordIndex = pickWordIndex(
      DAILY_WORD_COUNT,
      recent.map((p) => p.wordIndex),
    );
    await db.dailyPicks.put({ dateISO, wordIndex, pickedAt: Date.now() });
    return wordIndex;
  });
}

/**
 * The daily-challenge scenario drawn for a local date, drawing and persisting
 * one the first time that date is asked for — mirrors dailyWordIndex above,
 * so Today.tsx and Session.tsx always agree on the same scenario for the
 * same calendar date. `accountDay` (from dailyPathState()) picks which tier
 * pool the draw comes from (see dailyPoolFor in lib/daily.ts).
 */
export async function dailyScenarioId(accountDay: number, dateISO = todayISO()): Promise<string> {
  return db.transaction("rw", db.dailyScenarioPicks, async () => {
    const existing = await db.dailyScenarioPicks.get(dateISO);
    if (existing) return existing.scenarioId;

    const recent = await db.dailyScenarioPicks
      .where("dateISO")
      .below(dateISO)
      .reverse()
      .limit(RECENT_DAILY_MEMORY)
      .toArray();

    const pick = pickScenario(
      dailyPoolFor(accountDay),
      recent.map((p) => p.scenarioId),
    );
    await db.dailyScenarioPicks.put({ dateISO, scenarioId: pick.id, pickedAt: Date.now() });
    return pick.id;
  });
}

/** Pick a different daily scenario, excluding the one currently on screen and recent ones. */
export async function rerollDailyScenario(accountDay: number, dateISO = todayISO()): Promise<string> {
  return db.transaction("rw", db.dailyScenarioPicks, async () => {
    const recent = await db.dailyScenarioPicks
      .where("dateISO")
      .below(dateISO)
      .reverse()
      .limit(RECENT_DAILY_MEMORY)
      .toArray();

    const current = await db.dailyScenarioPicks.get(dateISO);
    const avoid = current ? [current.scenarioId] : [];
    const recentIds = recent.map((p) => p.scenarioId);

    const pick = pickScenario(
      dailyPoolFor(accountDay),
      [...avoid, ...recentIds],
    );
    await db.dailyScenarioPicks.put({ dateISO, scenarioId: pick.id, pickedAt: Date.now() });
    return pick.id;
  });
}

/**
 * Wipe every trace of the user from this device: the whole IndexedDB database
 * (sessions, transcripts, XP/progress) plus all orato.* localStorage keys
 * (settings/preferences). Callers should hard-reload afterwards so the app
 * boots into its first-launch state on empty stores.
 *
 * The daily word and scenario picks are deliberately carried across the wipe.
 * They are not user progress — they are calendar-keyed random draws — and
 * restoring them is what guarantees a reset can never rewind either draw to
 * "day one" or change the pick out from under the user mid-day.
 */
export async function resetAllData(): Promise<void> {
  let wordPicks: DailyPick[] = [];
  let scenarioPicks: DailyScenarioPick[] = [];
  try {
    [wordPicks, scenarioPicks] = await Promise.all([
      db.dailyPicks.toArray(),
      db.dailyScenarioPicks.toArray(),
    ]);
  } catch {
    // Nothing drawn yet, or the store predates these versions — nothing to carry over.
  }

  await db.delete();
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("orato.")) localStorage.removeItem(key);
  }

  if (wordPicks.length > 0 || scenarioPicks.length > 0) {
    await db.open();
    if (wordPicks.length > 0) await db.dailyPicks.bulkPut(wordPicks);
    if (scenarioPicks.length > 0) await db.dailyScenarioPicks.bulkPut(scenarioPicks);
  }
}

export async function getProgressState(): Promise<ProgressState> {
  return (await db.progress.get("main")) ?? (await recomputeProgress());
}

/** Distinct local dates that have at least one completed daily-path session. */
export async function completedDailyDates(): Promise<string[]> {
  const daily = await db.sessions.where("kind").equals("daily").toArray();
  return [...new Set(daily.map((s) => s.dateISO))].sort();
}

/**
 * The user's current position on the path. One daily challenge per calendar
 * day; missed days don't skip content — the path waits.
 * Returns the day to practice today and whether today is already done.
 */
export async function dailyPathState(): Promise<{ day: number; doneToday: boolean }> {
  const dates = await completedDailyDates();
  const today = todayISO();
  const doneToday = dates.includes(today);
  const day = doneToday ? dates.length : dates.length + 1;
  return { day, doneToday };
}

/** Consecutive calendar days (ending today or yesterday) with any session. */
export async function currentStreak(): Promise<number> {
  const sessions = await db.sessions.toArray();
  const dates = new Set(sessions.map((s) => s.dateISO));
  if (dates.size === 0) return 0;

  const cursor = new Date();
  if (!dates.has(todayISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dates.has(todayISO(cursor))) return 0;
  }
  let streak = 0;
  while (dates.has(todayISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
