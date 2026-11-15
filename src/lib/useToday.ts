import { useEffect, useState } from "react";
import { todayISO } from "./db";

/**
 * Today's local date (yyyy-mm-dd), kept current while the app stays open.
 *
 * A home-screen app is rarely closed: iOS and Android keep it suspended for
 * days. Screens that read "today" once on mount therefore showed yesterday's
 * word, challenge and "done today" the next morning. This re-checks when the
 * app returns to the foreground and at local midnight; React skips the
 * re-render when the date has not actually changed.
 */
export function useToday(): string {
  const [today, setToday] = useState(() => todayISO());

  useEffect(() => {
    const check = () => setToday(todayISO());
    let timer = 0;
    const scheduleMidnight = () => {
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 1, 0);
      timer = window.setTimeout(() => {
        check();
        scheduleMidnight();
      }, next.getTime() - now.getTime());
    };
    scheduleMidnight();
    const onVisible = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
    };
  }, []);

  return today;
}
