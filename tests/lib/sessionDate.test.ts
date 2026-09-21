import { describe, it, expect } from "vitest";
import { sessionDateISO, todayISO } from "@/lib/db";

/**
 * A session's calendar date must follow the moment the recording STARTED.
 * Stamping it at save time credits a take that crosses midnight to the wrong
 * day, which leaves the day the user actually practiced with no session —
 * and silently breaks a streak that cannot be repaired (no accounts, no
 * backup, no edit UI).
 */
describe("sessionDateISO", () => {
  it("credits a recording that crosses midnight to the day it started", () => {
    // Starts 23:59:00, runs 2 minutes, so it is saved at 00:01 the next day.
    const startedAt = new Date(2026, 8, 20, 23, 59, 0).getTime();
    expect(sessionDateISO(startedAt)).toBe("2026-09-20");
  });

  it("agrees with todayISO for a recording inside one day", () => {
    const startedAt = new Date(2026, 8, 20, 14, 30, 0).getTime();
    expect(sessionDateISO(startedAt)).toBe(todayISO(new Date(startedAt)));
    expect(sessionDateISO(startedAt)).toBe("2026-09-20");
  });

  it("uses local calendar fields, not UTC", () => {
    // 00:30 local on the 21st is still the 21st even where UTC says the 20th.
    const startedAt = new Date(2026, 8, 21, 0, 30, 0).getTime();
    expect(sessionDateISO(startedAt)).toBe("2026-09-21");
  });
});
