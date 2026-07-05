import { useLayoutEffect, useMemo, useRef, useState } from "react";

export interface TrendPoint {
  id: number;
  score: number;
  dateISO: string;
  title: string;
}

const H = 170;
const PAD = { top: 12, right: 12, bottom: 22, left: 30 };

/**
 * Single-series score trend over the journey. Fixed 0–100 domain, recessive
 * grid, gold stroke (validated against the dark surface), crosshair + tooltip
 * on hover/touch. The history list below the chart is the table view.
 */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geom = useMemo(() => {
    if (width === 0 || points.length < 2) return null;
    const innerW = width - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
    const y = (v: number) => PAD.top + (1 - v / 100) * innerH;
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(" ");
    return { x, y, path, innerW };
  }, [width, points]);

  if (points.length < 2) return null;

  function locate(clientX: number) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || !geom) return;
    const rel = clientX - rect.left - PAD.left;
    const idx = Math.round((rel / geom.innerW) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, idx)));
  }

  const hovered = hover !== null ? points[hover] : null;

  return (
    <div
      ref={wrapRef}
      className="relative"
      onPointerMove={(e) => locate(e.clientX)}
      onPointerLeave={() => setHover(null)}
    >
      <svg width="100%" height={H} role="img" aria-label="Score trend">
        {/* Recessive grid: 0 / 50 / 100 */}
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={geom?.y(v)}
              y2={geom?.y(v)}
              stroke="var(--color-line)"
              strokeWidth="1"
              strokeDasharray={v === 0 ? undefined : "2 4"}
            />
            <text x={PAD.left - 8} y={(geom?.y(v) ?? 0) + 3.5} textAnchor="end" fontSize="10" fill="var(--color-faint)" className="tnum">
              {v}
            </text>
          </g>
        ))}

        {geom && (
          <>
            <path d={geom.path} fill="none" stroke="var(--color-chart)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {/* Last point: always marked — the current state of the journey */}
            <circle cx={geom.x(points.length - 1)} cy={geom.y(points[points.length - 1].score)} r="3.5" fill="var(--color-accent)" />
            {/* Crosshair + hover marker */}
            {hover !== null && (
              <>
                <line x1={geom.x(hover)} x2={geom.x(hover)} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--color-line)" strokeWidth="1" />
                <circle cx={geom.x(hover)} cy={geom.y(points[hover].score)} r="4.5" fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth="2" />
              </>
            )}
          </>
        )}
      </svg>

      {hovered && geom && hover !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs shadow-none"
          style={{
            left: Math.max(60, Math.min(width - 60, geom.x(hover))),
            top: Math.max(0, geom.y(hovered.score) - 58),
          }}
        >
          <p className="tnum font-semibold text-ink">{hovered.score}</p>
          <p className="mt-0.5 max-w-40 truncate text-muted">{hovered.title}</p>
          <p className="tnum text-faint">{hovered.dateISO}</p>
        </div>
      )}
    </div>
  );
}
