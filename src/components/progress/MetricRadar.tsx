import { useMemo, useRef, useState, type MouseEvent } from "react";
import { Radar } from "react-chartjs-2";
import type { Chart as ChartJS, ChartOptions } from "chart.js";
import { useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { METRIC_KEYS, type EightScores, type MetricKey } from "@/lib/types";
import { METRIC_META } from "@/lib/metricMeta";
import { letterGrade } from "@/lib/grade";
import { scoreColorVar } from "@/lib/scoreColor";
import { resolveScoreColor, resolveToken } from "@/lib/charts";
import { GradeLetter } from "@/components/GradeLetter";

interface MetricRadarProps {
  /** Latest scored session's eight scores; null renders the empty state. */
  current: EightScores | null;
  /** Session before it — the dashed ghost. Omitted with fewer than 2 sessions. */
  previous?: EightScores | null;
  /** Per-metric coach sentences from the latest session's report. */
  oneLiners?: Partial<Record<MetricKey, string>>;
}

/** Append an alpha channel to a resolved #rrggbb token for canvas fills. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return hex.length === 7 ? `${hex}${a}` : hex;
}

/**
 * The Progress speaking profile: an eight-axis radar over the last session,
 * a dashed ghost of the one before, and a tap-to-reveal feedback panel.
 * Replaces the old eight-bar STATS list and the Focus Point card.
 *
 * Chart.js limit, accepted per spec: pointLabels cannot style the two lines
 * of one label independently, so both lines render uniform 11px gold.
 */
export function MetricRadar({ current, previous, oneLiners }: MetricRadarProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const chartRef = useRef<ChartJS<"radar"> | null>(null);

  const lowest = useMemo(() => {
    if (!current) return METRIC_KEYS[0];
    let worst: MetricKey = METRIC_KEYS[0];
    let worstVal = Infinity;
    for (const key of METRIC_KEYS) {
      const v = current[key];
      if (v !== null && v < worstVal) {
        worstVal = v;
        worst = key;
      }
    }
    return worst;
  }, [current]);
  const [selected, setSelected] = useState<MetricKey>(lowest);

  const colors = useMemo(
    () => ({
      gold: resolveToken("--orato-gold"),
      bronze: resolveToken("--orato-bronze"),
      obsidian: resolveToken("--orato-obsidian"),
      wineShadow: resolveToken("--orato-wine-shadow"),
    }),
    [],
  );

  if (!current) {
    return (
      <p className="box-border py-8 text-center text-sm text-claret-light" style={{ overflowWrap: "break-word" }}>
        {t("radarEmpty")}
      </p>
    );
  }

  const values = METRIC_KEYS.map((key) => current[key] ?? 0);
  const shortNames = METRIC_KEYS.map((key) => t(METRIC_META[key].shortKey));

  const datasets = [
    {
      label: "current",
      data: values,
      borderColor: colors.gold,
      borderWidth: 2,
      fill: true,
      backgroundColor: withAlpha(colors.gold, 0.16),
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: METRIC_KEYS.map((key) => resolveScoreColor(current[key] ?? 0)),
      pointBorderColor: colors.obsidian,
      pointBorderWidth: 2,
      order: 1,
    },
    ...(previous
      ? [
          {
            label: "previous",
            data: METRIC_KEYS.map((key) => previous[key] ?? 0),
            borderColor: colors.bronze,
            borderWidth: 1.5,
            borderDash: [4, 4],
            fill: true,
            backgroundColor: withAlpha(colors.bronze, 0.1),
            pointRadius: 0,
            pointHoverRadius: 0,
            order: 2,
          },
        ]
      : []),
  ];

  const options: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: reduced
      ? false
      : {
          duration: 900,
          easing: "easeOutExpo",
          // Ghost settles in after the main polygon has expanded.
          delay: (ctx) => (ctx.datasetIndex === 1 ? 900 : 0),
        },
    plugins: { tooltip: { enabled: false } },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false, stepSize: 25 },
        grid: { color: colors.wineShadow },
        angleLines: { color: colors.wineShadow },
        pointLabels: {
          padding: 18,
          color: colors.gold,
          font: { size: 11 },
          callback: (_label, index) => [shortNames[index], String(current[METRIC_KEYS[index]] ?? "–")],
        },
      },
    },
  };

  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const chart = chartRef.current;
    if (!chart) return;
    const elements = chart.getElementsAtEventForMode(event.nativeEvent, "nearest", { intersect: false }, false);
    const first = elements[0];
    if (first) setSelected(METRIC_KEYS[first.index]);
  };

  const detail = buildDetail(selected, current, previous, oneLiners);

  return (
    <div className="box-border w-full">
      {/* Custom HTML legend — the built-in one is not registered */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[11px] text-muted">
          <span aria-hidden="true" className="inline-block h-[3px] w-2.5 rounded-full bg-gold" />
          {t("radarLegendCurrent")}
        </span>
        {previous && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <span
              aria-hidden="true"
              className="inline-block h-0 w-2.5 border-t-2 border-dashed border-bronze"
            />
            {t("radarLegendPrev")}
          </span>
        )}
      </div>

      <div className="relative w-full p-6" style={{ height: 300, boxSizing: "content-box" }}>
        <Radar ref={chartRef} data={{ labels: shortNames, datasets }} options={options} onClick={handleClick} />
      </div>

      {/* Metric pills — wrap, never overflow horizontally */}
      <div className="flex flex-wrap gap-2">
        {METRIC_KEYS.map((key) => {
          const score = current[key];
          const color = score !== null ? scoreColorVar(score) : "var(--text-muted)";
          const active = selected === key;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              aria-pressed={active}
              className={`box-border min-h-11 rounded-(--radius-pill) border px-3 py-1.5 text-sm transition-colors duration-150 ${
                active ? "bg-wine" : "bg-transparent"
              }`}
              style={{
                color,
                borderColor: active ? color : "var(--orato-wine)",
                whiteSpace: "normal",
                overflowWrap: "break-word",
              }}
            >
              {t(METRIC_META[key].shortKey)}
            </button>
          );
        })}
      </div>

      {/* Detail card */}
      <div
        className="mt-3 box-border rounded-(--radius-control) border border-wine bg-deep-wine p-4"
        style={{ minHeight: 96 }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[15px] font-medium text-vellum">{t(METRIC_META[selected].nameKey)}</span>
          {detail.score !== null && (
            <span className="tnum flex items-baseline gap-1 text-[15px] font-semibold" style={{ color: detail.color }}>
              {detail.score} · <GradeLetter grade={letterGrade(detail.score)} />
            </span>
          )}
          {detail.delta !== null && (
            <span className={`tnum text-xs ${detail.delta >= 0 ? "text-verdigris" : "text-bole"}`}>
              {detail.delta >= 0 ? "+" : ""}
              {detail.delta} {t("metricDeltaVs")}
            </span>
          )}
        </div>
        <p
          className={`mt-2 text-[13px] ${detail.sentence ? "text-gold" : "text-claret-light"}`}
          style={{ lineHeight: 1.6, overflowWrap: "anywhere" }}
        >
          {detail.sentence ?? t("metricNoNote")}
        </p>
      </div>
    </div>
  );
}

function buildDetail(
  key: MetricKey,
  current: EightScores,
  previous: EightScores | null | undefined,
  oneLiners: Partial<Record<MetricKey, string>> | undefined,
) {
  const score = current[key];
  const prevScore = previous?.[key] ?? null;
  return {
    score,
    color: score !== null ? scoreColorVar(score) : "var(--text-muted)",
    delta: score !== null && prevScore !== null ? score - prevScore : null,
    sentence: oneLiners?.[key] || null,
  };
}
