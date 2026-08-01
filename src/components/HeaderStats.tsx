import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, currentStreak } from "@/lib/db";
import { progressFromSessions } from "@/lib/progression";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./Icon";

/**
 * The slim streak + XP row that sits directly under the header logo, on every
 * screen. Same numbers the Today pin and the Progress screen show — read live
 * from the same IndexedDB tables via Dexie's useLiveQuery, so finishing a
 * session or earning a word bonus updates them without a reload.
 *
 * XP is recomputed from source here rather than read out of the `progress`
 * row: `recomputeProgress()` writes, and a write inside useLiveQuery would
 * invalidate its own query forever. `progressFromSessions` is the same pure
 * function that row is built from, so the two can't drift.
 */
export function HeaderStats() {
  const { t } = useI18n();

  const streak = useLiveQuery(() => currentStreak(), [], null);
  const xp = useLiveQuery(async () => {
    const [sessions, bonuses] = await Promise.all([
      db.sessions.toArray(),
      db.wordBonuses.toArray(),
    ]);
    const bonusXp = bonuses.reduce((sum, b) => sum + b.xp, 0);
    return progressFromSessions(sessions, bonusXp).cumulativeXp;
  }, []);

  // One champagne sheen sweep when XP increases — never on a loop. The pill
  // is re-keyed so the one-shot CSS animation restarts per gain.
  const prevXp = useRef<number | undefined>(undefined);
  const [sheenKey, setSheenKey] = useState(0);
  useEffect(() => {
    if (xp !== undefined && prevXp.current !== undefined && xp > prevXp.current) {
      setSheenKey((k) => k + 1);
    }
    if (xp !== undefined) prevXp.current = xp;
  }, [xp]);

  // Hold the row's height while IndexedDB answers, so the header never jumps.
  const streakLabel =
    streak === 1 ? t("streakOneDay") : streak && streak > 0 ? t("streakDays", { n: streak }) : t("streakNone");

  return (
    <div className="flex items-center justify-center gap-2" data-testid="header-stats">
      <span
        className="flex items-center gap-1.5 rounded-full border border-gold/45 bg-card/70 px-2.5 py-0.5"
        role="status"
        aria-label={streakLabel}
        data-testid="streak-pin"
      >
        <Icon name="flame" size={13} className="text-gold" />
        <span className={`tnum text-xs font-semibold text-gold ${streak !== null && streak >= 3 ? "shimmer-text" : ""}`}>
          {streak ?? "—"}
        </span>
      </span>
      <span
        key={sheenKey}
        className={`flex items-center gap-1.5 rounded-full border border-gold/45 bg-card/70 px-2.5 py-0.5 ${sheenKey > 0 ? "xp-sheen" : ""}`}
        role="status"
        aria-label={xp === undefined ? undefined : t("xpTotal", { n: xp })}
        data-testid="xp-pill"
      >
        <Icon name="bolt" size={13} className="text-gold" />
        <span className="tnum text-xs font-semibold text-gold">
          {xp === undefined ? "—" : `${xp} XP`}
        </span>
      </span>
    </div>
  );
}
