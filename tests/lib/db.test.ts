import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Dexie from "dexie";
import type { Session } from "@/lib/types";

/**
 * The data layer holds everything the user can never get back — there are no
 * accounts, no server copy and no export. It also had zero test coverage until
 * fake-indexeddb was added, because Node has no IndexedDB at all.
 *
 * Each test gets a fresh module registry and an empty store — see freshDb()
 * for why swapping the IndexedDB factory is not how you isolate these.
 */
const DB_NAME = "orato";

/** Connections opened by the current test, closed in afterEach so the next delete isn't blocked. */
const openConnections: Dexie[] = [];

/**
 * A db.ts bound to an empty store.
 *
 * Note what does NOT work here: swapping `globalThis.indexedDB` for a new
 * IDBFactory. Dexie captures the factory into `Dexie.dependencies` when the
 * dexie module itself loads, so a later swap is ignored and every test silently
 * shares one database. Deleting the database between tests is what actually
 * isolates them.
 */
async function freshDb() {
  // db.ts builds its Dexie instance at import time, and Vitest caches modules
  // per file, so the registry has to be reset for each test to get its own.
  vi.resetModules();
  const mod = await import("@/lib/db");
  openConnections.push(mod.db);
  await mod.db.open();
  return mod;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(async () => {
  for (const conn of openConnections.splice(0)) conn.close();
  await Dexie.delete(DB_NAME);
  localStorage.clear();
});

/** A minimally valid stored session. */
function session(over: Partial<Session> = {}): Session {
  return {
    kind: "daily",
    refId: "imp-001",
    day: 1,
    lang: "en",
    dateISO: "2026-09-20",
    startedAt: new Date(2026, 8, 20, 10, 0, 0).getTime(),
    durationSec: 60,
    transcript: "a stored transcript that must survive every migration intact",
    segments: [{ text: "a stored transcript", t: 0 }],
    // Metrics/scores are not what these tests are about; the shape is enough.
    metrics: {
      durationSec: 60,
      wordCount: 120,
      wpm: 120,
      fillers: { total: 0, perMin: 0, counts: {} },
      repetitions: { count: 0, examples: [] },
      pauses: { count: 0, longestMs: 0 },
      vocab: { unique: 90, ttr: 0.75, avgWordLen: 4.5 },
      paceScore: 100,
      fillerScore: 100,
      fluencyScore: 100,
    },
    ai: null,
    scores: {
      pace: 100,
      volume: null,
      fillers: 100,
      fluency: 100,
      eloquence: null,
      structure: null,
      stylistic: null,
      comprehensiveness: null,
      logic: null,
      phrasing: null,
      professionalism: null,
      overall: 100,
    },
    report: null,
    promptTitle: "A prompt",
    promptText: "Say something.",
    ...over,
  };
}

describe("schema migrations", () => {
  /**
   * The reason every upgrade path is safe is structural: the `sessions` index
   * string is byte-identical across all five versions, so no version ever
   * reindexes the one table holding irreplaceable data. These tests exist to
   * fail loudly if that ever stops being true.
   */
  const SESSIONS_INDEX = "++id, dateISO, kind, startedAt, day";

  const legacySchemas: Record<number, Record<string, string | null>> = {
    1: { sessions: SESSIONS_INDEX },
    2: { sessions: SESSIONS_INDEX, progress: "id" },
    3: { sessions: SESSIONS_INDEX, progress: "id", wordBonuses: "dateISO" },
    4: { sessions: SESSIONS_INDEX, progress: "id", wordBonuses: "dateISO", dailyPicks: "dateISO" },
  };

  for (const version of [1, 2, 3, 4] as const) {
    it(`carries a session and its transcript from v${version} through to v5`, async () => {
      // Build the store at the old version and seed it.
      const old = new Dexie(DB_NAME);
      old.version(version).stores(legacySchemas[version]);
      await old.open();
      await old.table("sessions").add(session());
      if (version >= 4) {
        await old.table("dailyPicks").put({ dateISO: "2026-09-20", wordIndex: 7, pickedAt: Date.now() });
      }
      if (version >= 3) {
        await old.table("wordBonuses").put({ dateISO: "2026-09-20", awarded: true });
      }
      old.close();

      // Reopen through the app's own schema chain.
      const { db } = await freshDb();

      const rows = await db.sessions.toArray();
      expect(rows).toHaveLength(1);
      expect(rows[0].transcript).toBe(session().transcript);

      expect(db.tables.map((t) => t.name).sort()).toEqual([
        "dailyPicks",
        "dailyScenarioPicks",
        "progress",
        "sessions",
      ]);

      if (version >= 4) {
        expect(await db.dailyPicks.get("2026-09-20")).toMatchObject({ wordIndex: 7 });
      }
      db.close();
    });
  }
});

describe("currentStreak", () => {
  it("is 0 with no sessions", async () => {
    const { currentStreak, db } = await freshDb();
    expect(await currentStreak()).toBe(0);
    db.close();
  });

  it("counts consecutive days ending today", async () => {
    const { currentStreak, db, todayISO } = await freshDb();
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return todayISO(d);
    };
    for (const offset of [0, 1, 2]) {
      await db.sessions.add(session({ dateISO: day(offset) }));
    }
    expect(await currentStreak()).toBe(3);
    db.close();
  });

  it("allows one grace day — a streak ending yesterday still counts", async () => {
    const { currentStreak, db, todayISO } = await freshDb();
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return todayISO(d);
    };
    for (const offset of [1, 2]) {
      await db.sessions.add(session({ dateISO: day(offset) }));
    }
    expect(await currentStreak()).toBe(2);
    db.close();
  });

  it("counts only the most recent run, not days before a gap", async () => {
    const { currentStreak, db, todayISO } = await freshDb();
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return todayISO(d);
    };
    // Today and yesterday, then a hole at 2, then more history.
    for (const offset of [0, 1, 3, 4, 5]) {
      await db.sessions.add(session({ dateISO: day(offset) }));
    }
    expect(await currentStreak()).toBe(2);
    db.close();
  });

  it("survives a two-day forward calendar jump within the wall-clock grace", async () => {
    // Flying LAX->NRT skips a local date while only ~14h of wall time passes;
    // the old today-or-yesterday test zeroed a streak the user never broke.
    const { currentStreak, db, todayISO } = await freshDb();
    const day = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return todayISO(d);
    };
    for (const offset of [2, 3, 4]) {
      await db.sessions.add(session({ dateISO: day(offset) }));
    }
    expect(await currentStreak()).toBe(3);
    db.close();
  });

  it("is 0 once the gap exceeds the grace window", async () => {
    const { currentStreak, db, todayISO } = await freshDb();
    const d = new Date();
    d.setDate(d.getDate() - 6);
    await db.sessions.add(session({ dateISO: todayISO(d) }));
    expect(await currentStreak()).toBe(0);
    db.close();
  });

  it("ignores a future-dated session from a bad device clock", async () => {
    const { currentStreak, db, todayISO } = await freshDb();
    const future = new Date();
    future.setFullYear(future.getFullYear() + 2);
    await db.sessions.add(session({ dateISO: todayISO(future) }));
    expect(await currentStreak()).toBe(0);
    db.close();
  });
});

describe("dailyPathState", () => {
  it("does not let a future-dated session inflate the day counter", async () => {
    const { dailyPathState, db, todayISO } = await freshDb();
    const future = new Date();
    future.setFullYear(future.getFullYear() + 2);
    await db.sessions.add(session({ dateISO: todayISO(future) }));
    // One bogus row must not advance the path or claim today is done.
    expect(await dailyPathState()).toEqual({ day: 1, doneToday: false });
    db.close();
  });

  it("reports today as done once a daily session exists for it", async () => {
    const { dailyPathState, db, todayISO } = await freshDb();
    await db.sessions.add(session({ dateISO: todayISO() }));
    expect(await dailyPathState()).toEqual({ day: 1, doneToday: true });
    db.close();
  });
});

describe("resetAllData", () => {
  it("clears sessions and progress but carries the calendar-keyed picks", async () => {
    const { resetAllData, db, recomputeProgress } = await freshDb();
    await db.sessions.add(session());
    await recomputeProgress();
    await db.dailyPicks.put({ dateISO: "2026-09-20", wordIndex: 7, pickedAt: 123 });
    await db.dailyScenarioPicks.put({ dateISO: "2026-09-20", scenarioId: "imp-001", pickedAt: 123 });
    localStorage.setItem("orato.lang", "de");
    localStorage.setItem("unrelated.key", "keep me");

    await resetAllData();

    expect(await db.sessions.count()).toBe(0);
    expect(await db.progress.count()).toBe(0);
    expect(await db.dailyPicks.get("2026-09-20")).toMatchObject({ wordIndex: 7 });
    expect(await db.dailyScenarioPicks.get("2026-09-20")).toMatchObject({ scenarioId: "imp-001" });
    expect(localStorage.getItem("orato.lang")).toBeNull();
    expect(localStorage.getItem("unrelated.key")).toBe("keep me");
    db.close();
  });

  it("leaves the database usable when there were no picks to carry over", async () => {
    // Dexie does not auto-reopen after delete(), so skipping the reopen left
    // the next table access throwing DatabaseClosedError.
    const { resetAllData, db } = await freshDb();
    await db.sessions.add(session());

    await resetAllData();

    expect(db.isOpen()).toBe(true);
    await expect(db.sessions.count()).resolves.toBe(0);
    db.close();
  });
});

describe("recomputeProgress", () => {
  const scored = (xp: number, startedAt: number) =>
    session({
      startedAt,
      progress: {
        scores: {
          clarity: 80,
          confidence: 80,
          structure: 80,
          pace: 80,
          fluency: 80,
          wordPower: 80,
          conciseness: 80,
          engagement: 80,
        },
        overallScore: 80,
        xpEarned: xp,
        wordOfDayUsed: false,
        wpm: 120,
        xpPending: false,
      },
    });

  it("is idempotent — the docstring's core claim", async () => {
    const { recomputeProgress, db } = await freshDb();
    await db.sessions.add(scored(50, Date.now()));

    const first = await recomputeProgress();
    const second = await recomputeProgress();
    const third = await recomputeProgress();

    expect(second.cumulativeXp).toBe(first.cumulativeXp);
    expect(third.cumulativeXp).toBe(first.cumulativeXp);
    expect(first.cumulativeXp).toBe(50);
    db.close();
  });

  it("awards nothing for a session still pending analysis", async () => {
    const { recomputeProgress, db } = await freshDb();
    await db.sessions.add(
      session({
        progress: {
          scores: {
            clarity: null,
            confidence: null,
            structure: null,
            pace: 80,
            fluency: 80,
            wordPower: null,
            conciseness: null,
            engagement: null,
          },
          overallScore: null,
          xpEarned: 0,
          wordOfDayUsed: false,
          wpm: 120,
          xpPending: true,
        },
      }),
    );
    expect((await recomputeProgress()).cumulativeXp).toBe(0);
    db.close();
  });

  it("tolerates a pre-progression session with no progress record", async () => {
    const { recomputeProgress, db } = await freshDb();
    await db.sessions.add(session({ progress: undefined }));
    await expect(recomputeProgress()).resolves.toMatchObject({ cumulativeXp: 0 });
    db.close();
  });

  it("replaces rather than accumulates when a session is re-scored", async () => {
    const { recomputeProgress, db } = await freshDb();
    const id = await db.sessions.add(scored(50, Date.now()));
    expect((await recomputeProgress()).cumulativeXp).toBe(50);

    // Re-analysis overwrites the progress record, as Feedback.tsx does.
    const row = await db.sessions.get(id as number);
    await db.sessions.update(id as number, {
      progress: { ...row!.progress!, xpEarned: 70 },
    });

    expect((await recomputeProgress()).cumulativeXp).toBe(70);
    db.close();
  });
});
