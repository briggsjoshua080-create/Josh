import { useRef, useState } from "react";

interface SparklineProps {
  /** One value per time bucket, left → right. */
  values: number[];
  /** Shaded easy-to-follow region, in the same unit as values. */
  band: [number, number];
  /** Label for the shaded band, e.g. "115–165 easy to follow". */
  bandLabel: string;
  /** Accessible description of the whole figure. */
  ariaLabel: string;
  /** Unit shown in the hover readout, e.g. "wpm". */
  unit: string;
}

const W = 300;
const H = 88;
const PAD_X = 6;
const PAD_TOP = 20;
const PAD_BOTTOM = 8;

/**
 * WPM-over-time sparkline: a single 2px line over a shaded target band.
 * No axes — the band carries the reference; hover/touch reads out one bucket.
 */
export function Sparkline({ values, band, bandLabel, ariaLabel, unit }: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  if (values.length < 2) return null;

  const lo = Math.min(...values, band[0]);
  const hi = Math.max(...values, band[1]);
  const span = Math.max(1, hi - lo);
  const x = (i: number) => PAD_X + (i / (values.length - 1)) * (W - PAD_X * 2);
  const y = (v: number) => PAD_TOP + (1 - (v - lo) / span) * (H - PAD_TOP - PAD_BOTTOM);

  const path = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values.length - 1;
  const active = hover ?? last;

  function onPointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const frac = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(last, Math.round(frac * last))));
  }

  return (
    <figure className="m-0">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none"
        role="img"
        aria-label={ariaLabel}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
      >
        {/* Easy-to-follow band */}
        <rect
          x={PAD_X}
          width={W - PAD_X * 2}
          y={y(band[1])}
          height={Math.max(2, y(band[0]) - y(band[1]))}
          rx={2}
          fill="var(--color-surface-2)"
        />
        <path d={path} fill="none" stroke="var(--color-chart)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* Active bucket readout — ink tokens, never the series color */}
        <circle cx={x(active)} cy={y(values[active])} r={3.5} fill="var(--color-chart)" stroke="var(--color-bg)" strokeWidth={2} />
        <text
          x={x(active) < W / 2 ? x(active) + 8 : x(active) - 8}
          y={Math.max(12, y(values[active]) - 10)}
          textAnchor={x(active) < W / 2 ? "start" : "end"}
          fill="var(--color-ink)"
          fontSize={12}
          fontWeight={600}
          className="tnum"
        >
          {values[active]} {unit}
        </text>
      </svg>
      <figcaption className="mt-1 flex justify-between text-xs text-faint">
        <span>
          {band[0]}–{band[1]} {bandLabel}
        </span>
        <span className="tnum">
          {values[last]} {unit}
        </span>
      </figcaption>
    </figure>
  );
}
