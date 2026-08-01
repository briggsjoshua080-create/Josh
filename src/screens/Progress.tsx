import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { allSessions, currentStreak, recomputeProgress } from "@/lib/db";
import type { Session } from "@/lib/types";
import { levelForXp, type ProgressState } from "@/lib/progression";
import { scoreColorVar } from "@/lib/scoreColor";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { TrendChart } from "@/components/TrendChart";
import { MetricRadar } from "@/components/progress/MetricRadar";

export function Progress() {
  const { t, lang } = useI18n();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    (async () => {
      setSessions(await allSessions());
      setStreak(await currentStreak());
      // Recompute on entry: cheap, and self-heals after retries or old data.
      setProgress(await recomputeProgress());
    })();
  }, []);

  if (!sessions || !progress) return <ProgressSkeleton />;

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

  const level = levelForXp(progress.cumulativeXp);

  // Headline aggregates run over ALL sessions ever recorded, not a window.
  const allScores = sessions.map((s) => s.progress?.overallScore ?? s.scores.overall);
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const bestScore = Math.max(...allScores);

  // Radar data: the last two sessions that carry per-metric scores.
  const scored = sessions
    .filter((s) => s.progress?.scores)
    .sort((a, b) => a.startedAt - b.startedAt);
  const latest = scored.length > 0 ? scored[scored.length - 1] : null;
  const beforeLatest = scored.length > 1 ? scored[scored.length - 2] : null;

  return (
    <div className="pt-2 lg:pt-0">
      {/* â€”â€”â€” Level hero â€”â€”â€” */}
      <section className="snap-section">
      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="lectern tnum text-[3.5rem] leading-none font-semibold text-ink">{level.level}</span>
            <span className="lectern text-2xl text-ink/90">{level.rank.name[lang]}</span>
          </div>
          <p className="tnum mt-2 text-sm text-muted">{t("xpTotal", { n: progress.cumulativeXp })}</p>
        </div>
        <div className="flex items-center gap-1.5 pt-2 text-accent" aria-label={t("statStreak")}>
          <Icon name="flame" size={20} />
          <span className="tnum text-lg font-semibold">{streak}</span>
        </div>
      </div>

      <div className="mt-4">
        <XpBar progress={level.progress} />
        <p className="tnum mt-2 text-xs text-muted">
          {level.nextRank
            ? t("xpToNext", { n: level.xpToNext, rank: level.nextRank.name[lang] })
            : t("maxRank")}
        </p>
      </div>
      </section>

      {/* â€”â€”â€” Headline aggregates across all sessions â€”â€”â€” */}
      <section className="snap-section mt-8 grid grid-cols-4 gap-2" data-testid="progress-stats">
        <StatTile label={t("sessionsCount")} value={sessions.length} />
        <StatTile label={t("avgScore")} value={avgScore} />
        <StatTile label={t("bestScore")} value={bestScore} />
        <StatTile label={t("statStreak")} value={streak} />
      </section>

      {/* â€”â€”â€” Speaking profile radar (replaces the eight-bar list + Focus Point) â€”â€”â€” */}
      <section className="snap-section mt-10">
        <h2 className="label-caps">{t("radarTitle")}</h2>
        <div className="mt-4">
          <MetricRadar
            current={latest?.progress?.scores ?? null}
            previous={beforeLatest?.progress?.scores ?? null}
            oneLiners={latest?.report?.oneLiners}
          />
        </div>
      </section>

      {/* Trend */}
      {sessions.length >= 2 && (
        <section className="snap-section mt-10 border-t hairline pt-6">
          <h2 className="text-sm font-medium text-muted">{t("trendTitle")}</h2>
          <div className="mt-3">
            <TrendChart
              points={sessions.map((s) => ({
                id: s.id!,
                score: s.progress?.overallScore ?? s.scores.overall,
                dateISO: s.dateISO,
                title: s.promptTitle,
              }))}
            />
          </div>
        </section>
      )}

      {/* History */}
      <section className="snap-section mt-8">
        <h2 className="text-sm font-medium text-muted">{t("historyTitle")}</h2>
        <ul className="mt-3 flex flex-col">
          {[...sessions].reverse().map((s) => (
            <li key={s.id} className="border-b hairline">
              <Link to={`/feedback/${s.id}`} className="flex items-center gap-4 py-3.5 hover:bg-surface/50 -mx-2 px-2 rounded-(--radius-control) transition-colors">
                <span
                  className="tnum flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold"
                  style={{ color: scoreColorVar(s.progress?.overallScore ?? s.scores.overall) }}
                >
                  {s.progress?.overallScore ?? s.scores.overall}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-ink">{s.promptTitle}</span>
                  <span className="text-xs text-muted">
                    {s.kind === "daily" ? `${t("dayLabel", { n: s.day ?? 0 })} Â· ` : ""}
                    {s.dateISO}
                    {s.progress && s.progress.xpPending === false && (
                      <span className="tnum text-faint"> Â· +{s.progress.xpEarned} XP</span>
                    )}
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

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="box px-2 py-3 text-center">
      <p className="lectern tnum text-xl font-semibold text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

function XpBar({ progress }: { progress: number }) {
  const reduced = useReducedMotion();
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={reduced ? { width: `${progress * 100}%` } : { width: 0 }}
        animate={{ width: `${Math.max(progress * 100, 1)}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
      />
    </div>
  );
}

function ProgressSkeleton() {
  return (
    <div className="pt-2 lg:pt-0">
      <div className="mt-2 skeleton h-16 w-56" />
      <div className="mt-6 skeleton h-2 w-full" />
      <div className="mt-10 flex flex-col gap-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton h-10" />
        ))}
      </div>
    </div>
  );
}
