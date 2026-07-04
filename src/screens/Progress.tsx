import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { allSessions, currentStreak } from "@/lib/db";
import type { Session } from "@/lib/types";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";

export function Progress() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    (async () => {
      setSessions(await allSessions());
      setStreak(await currentStreak());
    })();
  }, []);

  if (!sessions) return null;

  if (sessions.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center pt-2 text-center">
        <Icon name="chart" size={40} className="text-faint" />
        <p className="mt-4 max-w-xs text-base text-muted">{t("emptyProgress")}</p>
        <Link to="/" className="mt-6">
          <Button>{t("emptyProgressCta")}</Button>
        </Link>
      </div>
    );
  }

  const scores = sessions.map((s) => s.scores.overall);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const best = Math.max(...scores);

  return (
    <div className="pt-2 lg:pt-0">
      <h1 className="text-2xl font-semibold text-ink">{t("progressTitle")}</h1>
      <p className="mt-1 text-sm text-muted">{t("progressSub")}</p>

      <div className="tnum mt-8 flex gap-8 border-t border-b hairline py-5">
        <Stat label={t("sessionsCount")} value={sessions.length} />
        <Stat label={t("avgScore")} value={avg} />
        <Stat label={t("bestScore")} value={best} />
        <Stat label={t("streakDays", { n: streak }).replace(/\d+ ?/, "")} value={streak} accent />
      </div>

      {/* History */}
      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted">{t("historyTitle")}</h2>
        <ul className="mt-3 flex flex-col">
          {[...sessions].reverse().map((s) => (
            <li key={s.id} className="border-b hairline">
              <Link to={`/feedback/${s.id}`} className="flex items-center gap-4 py-3.5 hover:bg-surface/50 -mx-2 px-2 rounded-lg transition-colors">
                <span className="tnum flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-accent">
                  {s.scores.overall}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-ink">{s.promptTitle}</span>
                  <span className="text-xs text-muted">
                    {s.kind === "daily" ? `${t("dayLabel", { n: s.day ?? 0 })} · ` : ""}
                    {s.dateISO}
                  </span>
                </span>
                <Icon name="arrowRight" size={16} className="shrink-0 text-faint" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className={`text-2xl font-semibold ${accent ? "text-accent" : "text-ink"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}
