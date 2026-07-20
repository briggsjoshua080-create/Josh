import Dexie, { type EntityTable } from "dexie";
import type { Session, WordBonus } from "./types";
import { progressFromSessions, WORD_USE_BONUS, type ProgressState } from "./progression";

/**
 * All user data lives here, on-device. No accounts, no server-side storage.
 * IndexedDB (not localStorage) because transcripts and history grow long.
 */
const db = new Dexie("orato") as Dexie & {
  sessions: EntityTable<Session, "id">;
  progress: EntityTable<ProgressState, "id">;
  wordBonuses: EntityTable<WordBonus, "dateISO">;
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
db.version(3).stores({
  sessions: "++id, dateISO, kind, startedAt, day",
  progress: "id",
  wordBonuses: "dateISO",
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
  const [sessions, bonuses] = await Promise.all([db.sessions.toArray(), db.wordBonuses.toArray()]);
  const bonusXp = bonuses.reduce((sum, b) => sum + b.xp, 0);
  const state = progressFromSessions(sessions, bonusXp);
  await db.progress.put(state);
  return state;
}

/** The word-use bonus already earned for a local date, if any. */
export async function getWordBonus(dateISO: string): Promise<WordBonus | undefined> {
  return db.wordBonuses.get(dateISO);
}

/**
 * Award the +100 XP "used the daily word in a sentence" bonus. Keyed by
 * today's date, so awarding twice on one day overwrites instead of stacking —
 * resubmitting can never farm XP.
 */
export async function awardWordUseBonus(day: number, word: string): Promise<ProgressState> {
  await db.wordBonuses.put({
    dateISO: todayISO(),
    day,
    word,
    xp: WORD_USE_BONUS,
    awardedAt: Date.now(),
  });
  return recomputeProgress();
}

/**
 * Wipe every trace of the user from this device: the whole IndexedDB database
 * (sessions, transcripts, XP/progress, word bonuses) plus all orato.*
 * localStorage keys (settings/preferences). Callers should hard-reload
 * afterwards so the app boots into its first-launch state on empty stores.
 */
export async function resetAllData(): Promise<void> {
  await db.delete();
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("orato.")) localStorage.removeItem(key);
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
