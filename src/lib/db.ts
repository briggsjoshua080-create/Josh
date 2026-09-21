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

/**
 * The `.stores()` strings above are APPEND-ONLY. Editing one in place rather
 * than adding a new version number gets silently "rescued" by Dexie's
 * SchemaDiff path — a console warning and an auto-patch — which also ratchets
 * the underlying IndexedDB version and can cause a later `.upgrade()` callback
 * to be skipped. Add a version; never rewrite one.
 *
 * Why every upgrade path is safe today: the `sessions` index string is
 * byte-identical across all five versions, so no version ever reindexes the one
 * table holding data the user cannot get back. Keep it that way.
 */
export { db };

/**
 * Surface a store that refuses to open. IndexedDB can fail for reasons that
 * have nothing to do with migrations — private browsing, restricted storage, a
 * corrupt store, quota exhaustion, or another tab holding a version upgrade.
 * Screens render their own recovery card (see LoadError); this exists so the
 * failure is logged once rather than surfacing only as an unhandled rejection.
 */
db.open().catch((err) => {
  console.error("IndexedDB failed to open:", err);
});

// Another tab upgraded the schema: close this connection so it doesn't block
// them, and let the screens' error paths ask the user to reload.
db.on("versionchange", () => {
  console.warn("IndexedDB version changed in another tab; closing this connection.");
  db.close();
  return false;
});

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * The calendar date a session belongs to, anchored to when the recording
 * STARTED rather than when it was saved. A take begun at 23:59 finishes on
 * the following date; stamping it then would leave the day the user actually
 * practiced with no session at all, breaking a streak with no way to repair
 * it (no accounts, no backup, no edit UI).
 */
export function sessionDateISO(startedAt: number): string {
  return todayISO(new Date(startedAt));
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

/**
 * Every scenario rejected by a reroll this session, so pressing it twice can't
 * walk A → B → A. In memory only: it's a within-session nicety, and the
 * calendar-keyed row remains the single source of truth for today's pick.
 */
const rejectedToday = new Set<string>();

/** Pick a different daily scenario, excluding the one on screen, those already rerolled away, and recent days'. */
export async function rerollDailyScenario(accountDay: number, dateISO = todayISO()): Promise<string> {
  return db.transaction("rw", db.dailyScenarioPicks, async () => {
    const recent = await db.dailyScenarioPicks
      .where("dateISO")
      .below(dateISO)
      .reverse()
      .limit(RECENT_DAILY_MEMORY)
      .toArray();

    const current = await db.dailyScenarioPicks.get(dateISO);
    if (current) rejectedToday.add(current.scenarioId);
    const recentIds = recent.map((p) => p.scenarioId);

    const pick = pickScenario(dailyPoolFor(accountDay), [...rejectedToday, ...recentIds]);
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
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("orato.")) localStorage.removeItem(key);
    }
  } catch {
    /* storage blocked — nothing persisted there to clear */
  }

  // Unconditionally: Dexie does not auto-reopen after an explicit delete(), so
  // skipping this left the database closed and the next table access throwing
  // DatabaseClosedError — reachable for anyone who resets before a pick exists.
  await db.open();
  if (wordPicks.length > 0) await db.dailyPicks.bulkPut(wordPicks);
  if (scenarioPicks.length > 0) await db.dailyScenarioPicks.bulkPut(scenarioPicks);
}

/**
 * Ask the browser to treat this origin's storage as persistent.
 *
 * Without it the bucket is "best-effort": browsers evict those first under
 * storage pressure, and iOS clears them after seven days of disuse for a PWA
 * that has not been added to the home screen. Since this app is the only copy
 * of the user's history, that is silent data loss with no user action involved.
 *
 * Returns whether storage is persisted, or null if the browser has no opinion.
 * Safe to call repeatedly; the browser only prompts (where it prompts at all)
 * once per origin.
 */
export async function requestPersistentStorage(): Promise<boolean | null> {
  try {
    if (!navigator.storage?.persist) return null;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return null;
  }
}

/** Whether the browser has already granted persistent storage for this origin. */
export async function isStoragePersisted(): Promise<boolean | null> {
  try {
    if (!navigator.storage?.persisted) return null;
    return await navigator.storage.persisted();
  } catch {
    return null;
  }
}

export async function getProgressState(): Promise<ProgressState> {
  return (await db.progress.get("main")) ?? (await recomputeProgress());
}

/**
 * Distinct local dates that have at least one completed daily-path session.
 *
 * Future dates are dropped. A phone that boots with a bogus clock before NTP
 * syncs (common after a flat battery) writes one, and it would otherwise count
 * forever — permanently shifting the "Day N" label and the difficulty tier.
 */
export async function completedDailyDates(): Promise<string[]> {
  const daily = await db.sessions.where("kind").equals("daily").toArray();
  const today = todayISO();
  return [...new Set(daily.map((s) => s.dateISO))].filter((d) => d <= today).sort();
}

/**
 * Every distinct local date with any session, newest first.
 *
 * Reads the dateISO index directly rather than pulling whole rows: the old
 * toArray() deserialized every transcript and segment array (hundreds of
 * objects per session) just to collect a set of date strings — and ran twice
 * per write, on every screen, because HeaderStats is mounted app-wide.
 */
async function sessionDatesDesc(): Promise<string[]> {
  const keys = (await db.sessions.orderBy("dateISO").uniqueKeys()) as string[];
  const today = todayISO();
  return keys.filter((d) => d <= today).reverse();
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

/**
 * How many calendar days a streak may have been idle before it is considered
 * broken. A plain "today or yesterday" test breaks a streak the user never
 * missed: fly LAX→NRT overnight and the local calendar skips a date entirely
 * while only ~14 hours of wall time pass. Measuring elapsed wall time as well
 * forgives that without forgiving a genuinely missed day.
 */
const STREAK_GRACE_MS = 44 * 60 * 60 * 1000;

/** Consecutive calendar days (ending at the most recent practice) with any session. */
export async function currentStreak(): Promise<number> {
  const dates = await sessionDatesDesc();
  if (dates.length === 0) return 0;
  const seen = new Set(dates);

  const today = todayISO();
  const newest = dates[0];

  // Anchor the walk at the newest practice date, not at "today", so a forward
  // calendar jump (timezone change, corrected clock) doesn't zero a streak the
  // user never broke — flying LAX->NRT skips a local date while only ~14 hours
  // of wall time pass.
  let cursor: Date;
  if (seen.has(today)) {
    cursor = new Date();
  } else {
    // Elapsed time comes from the session's own timestamp. Deriving it from the
    // date at midday instead made a two-calendar-day gap measure anywhere from
    // 36 to 60 hours depending on the time of day, so whether a streak survived
    // depended on when you happened to open the app.
    const last = await db.sessions.orderBy("startedAt").last();
    const elapsed = last ? Date.now() - last.startedAt : Infinity;
    if (!(elapsed >= 0 && elapsed <= STREAK_GRACE_MS)) return 0;
    cursor = new Date(`${newest}T12:00:00`);
  }

  let streak = 0;
  // setDate on local calendar fields, never now - 86400000: in a timezone that
  // skips midnight on a DST boundary the arithmetic version silently eats a day.
  while (seen.has(todayISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
