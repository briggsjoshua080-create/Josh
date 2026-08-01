import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { ChartOptions, Plugin, ScriptableContext } from "chart.js";
import { useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";
import { resolveScoreColor, resolveToken } from "@/lib/charts";

export interface TrendPoint {
  id: number;
  score: number;
  dateISO: string;
  title: string;
}

/** Append an alpha channel to a resolved #rrggbb token for canvas fills. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return hex.length === 7 ? `${hex}${a}` : hex;
}

/**
 * Score trend as an area chart: gold line over a fading gold wash, each
 * point filled with its score-band colour, and a dashed bronze reference
 * line at the all-time average. Draws on left-to-right over 900ms.
 */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  const reduced = useReducedMotion();
  const { t, lang } = useI18n();

  const colors = useMemo(
    () => ({
      gold: resolveToken("--orato-gold"),
      bronze: resolveToken("--orato-bronze"),
      obsidian: resolveToken("--orato-obsidian"),
      wineShadow: resolveToken("--orato-wine-shadow"),
      claretLight: resolveToken("--orato-claret-light"),
    }),
    [],
  );

  const average = Math.round(points.reduce((sum, p) => sum + p.score, 0) / Math.max(points.length, 1));
  const labels = points.map((p) =>
    new Date(`${p.dateISO}T00:00:00`).toLocaleDateString(lang === "de" ? "de-DE" : "en-US", {
      month: "short",
      day: "numeric",
    }),
  );

  // Right-aligned "avg" caption on the reference line.
  const avgLabel: Plugin<"line"> = useMemo(
    () => ({
      id: "oratoAvgLabel",
      afterDraw(chart) {
        const y = chart.scales.y.getPixelForValue(average);
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.font = "11px " + (getComputedStyle(document.documentElement).getPropertyValue("--font-sans") || "sans-serif");
        ctx.fillStyle = colors.bronze;
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(t("trendAvgLabel"), chartArea.right - 2, y - 3);
        ctx.restore();
      },
    }),
    [average, colors.bronze, t],
  );

  // Documented progressive-line pattern: each point lands in sequence so the
  // series draws on left-to-right across 900ms.
  const perPoint = 900 / Math.max(points.length, 1);
  const animation: ChartOptions<"line">["animation"] = reduced
    ? false
    : ({
        x: {
          type: "number",
          easing: "linear",
          duration: perPoint,
          from: NaN,
          delay(ctx: { type: string; index: number; xStarted?: boolean }) {
            if (ctx.type !== "data" || ctx.xStarted) return 0;
            ctx.xStarted = true;
            return ctx.index * perPoint;
          },
        },
        y: {
          type: "number",
          easing: "linear",
          duration: perPoint,
          from: "previousY",
          delay(ctx: { type: string; index: number; yStarted?: boolean }) {
            if (ctx.type !== "data" || ctx.yStarted) return 0;
            ctx.yStarted = true;
            return ctx.index * perPoint;
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation,
    plugins: { tooltip: { enabled: false } },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: colors.wineShadow, lineWidth: 1 },
        ticks: { color: colors.claretLight, font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { color: colors.claretLight, font: { size: 11 }, maxTicksLimit: 6, maxRotation: 0 },
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        data: points.map((p) => p.score),
        borderColor: colors.gold,
        borderWidth: 2,
        fill: true,
        backgroundColor: (ctx: ScriptableContext<"line">) => {
          const { chartArea, ctx: canvas } = ctx.chart;
          if (!chartArea) return "transparent";
          const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, withAlpha(colors.gold, 0.22));
          gradient.addColorStop(1, withAlpha(colors.gold, 0));
          return gradient;
        },
        pointRadius: 4,
        pointBackgroundColor: points.map((p) => resolveScoreColor(p.score)),
        pointBorderColor: colors.obsidian,
        pointBorderWidth: 2,
        order: 1,
      },
      {
        data: points.map(() => average),
        borderColor: colors.bronze,
        borderWidth: 1,
        borderDash: [4, 4],
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 2,
      },
    ],
  };

  return (
    <div className="relative w-full" style={{ height: 190 }} data-testid="trend-chart">
      <Line data={data} options={options} plugins={[avgLabel]} />
    </div>
  );
}
