import Dexie, { type EntityTable } from "dexie";
import type { Session } from "./types";

/**
 * All user data lives here, on-device. No accounts, no server-side storage.
 * IndexedDB (not localStorage) because transcripts and history grow long.
 */
const db = new Dexie("orato") as Dexie & {
  sessions: EntityTable<Session, "id">;
};

db.version(1).stores({
  sessions: "++id, dateISO, kind, startedAt, day",
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
