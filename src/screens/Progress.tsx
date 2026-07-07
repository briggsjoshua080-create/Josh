import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { allSessions, currentStreak, recomputeProgress } from "@/lib/db";
import { METRIC_KEYS, type MetricKey, type Session } from "@/lib/types";
import { levelForXp, type ProgressState } from "@/lib/progression";
import { METRIC_META } from "@/lib/metricMeta";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { TrendChart } from "@/components/TrendChart";

export function Progress() {
  const { t, lang } = useI18n();
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [openInfo, setOpenInfo] = useState<MetricKey | null>(null);

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

  return (
    <div className="pt-2 lg:pt-0">
      {/* ——— Level hero ——— */}
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

      {/* ——— The eight stats ——— */}
      <section className="mt-10">
        <h2 className="label-caps">{t("statsLabel")}</h2>
        <div className="mt-4 flex flex-col gap-5">
          {METRIC_KEYS.map((key, i) => (
            <StatRow
              key={key}
              metric={key}
              label={t(METRIC_META[key].nameKey)}
              explanation={t(METRIC_META[key].expKey)}
              average={progress.statAverages[key]}
              trend={progress.statTrends[key]}
              open={openInfo === key}
              onToggleInfo={() => setOpenInfo(openInfo === key ? null : key)}
              delay={0.04 * i}
            />
          ))}
        </div>
      </section>

      {/* Trend */}
      {sessions.length >= 2 && (
        <section className="mt-10 border-t hairline pt-6">
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
      <section className="mt-8">
        <h2 className="text-sm font-medium text-muted">{t("historyTitle")}</h2>
        <ul className="mt-3 flex flex-col">
          {[...sessions].reverse().map((s) => (
            <li key={s.id} className="border-b hairline">
              <Link to={`/feedback/${s.id}`} className="flex items-center gap-4 py-3.5 hover:bg-surface/50 -mx-2 px-2 rounded-lg transition-colors">
                <span className="tnum flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold text-accent">
                  {s.progress?.overallScore ?? s.scores.overall}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base text-ink">{s.promptTitle}</span>
                  <span className="text-xs text-muted">
                    {s.kind === "daily" ? `${t("dayLabel", { n: s.day ?? 0 })} · ` : ""}
                    {s.dateISO}
                    {s.progress && s.progress.xpPending === false && (
                      <span className="tnum text-faint"> · +{s.progress.xpEarned} XP</span>
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

function StatRow({
  metric,
  label,
  explanation,
  average,
  trend,
  open,
  onToggleInfo,
  delay,
}: {
  metric: MetricKey;
  label: string;
  explanation: string;
  average: number | null;
  trend: number;
  open: boolean;
  onToggleInfo: () => void;
  delay: number;
}) {
  const reduced = useReducedMotion();
  const meta = METRIC_META[metric];

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <Icon name={meta.icon} size={17} className="shrink-0 text-muted" />
        <span className="text-base font-medium text-ink">{label}</span>
        <button
          onClick={onToggleInfo}
          aria-label={`${label}: info`}
          aria-expanded={open}
          className="text-faint transition-colors hover:text-ink"
        >
          <Icon name="info" size={14} />
        </button>
        <span className="ml-auto flex items-baseline gap-2 whitespace-nowrap">
          {trend !== 0 && average !== null && (
            <span className={`tnum text-xs font-medium ${trend > 0 ? "text-ok" : "text-faint"}`}>
              {trend > 0 ? "↑" : "↓"}
              {Math.abs(trend)}
            </span>
          )}
          <span className="lectern tnum text-xl font-semibold text-ink">{average ?? "—"}</span>
        </span>
      </div>
      {open && <p className="mt-1.5 pl-[27px] text-sm text-muted">{explanation}</p>}
      <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-surface-2">
        {average !== null && (
          <motion.div
            className="h-full rounded-full"
            style={{ background: meta.tint }}
            initial={reduced ? { width: `${average}%` } : { width: 0 }}
            animate={{ width: `${average}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20, delay }}
          />
        )}
      </div>
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
