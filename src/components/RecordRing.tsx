import { useI18n } from "@/lib/i18n";

/**
 * Live-recording gauge. One wine-shadow track circle; the progress arc
 * sweeps 0 → maxSec and steps through five colour zones tied to the
 * prompt's own speaking window (never a fixed clock): warming up →
 * building → ideal window → wrap up → over. Zone changes tween over
 * 600ms; bronze ticks mark the window boundaries. Elapsed time sits in
 * the centre in serif vellum with the zone name beneath it.
 */

export type RingZone = "buildup" | "ideal" | "over" | "max";

export function ringZone(elapsed: number, ideal: [number, number], maxSec: number): RingZone {
  if (elapsed >= maxSec) return "max";
  if (elapsed > ideal[1]) return "over";
  if (elapsed >= ideal[0]) return "ideal";
  return "buildup";
}

type VisualZone = "warmup" | "building" | "ideal" | "wrapup" | "over";

function visualZone(elapsed: number, ideal: [number, number], maxSec: number): VisualZone {
  const zone = ringZone(elapsed, ideal, maxSec);
  if (zone === "buildup") return elapsed < ideal[0] / 2 ? "warmup" : "building";
  if (zone === "ideal") return "ideal";
  if (zone === "over") return "wrapup";
  return "over";
}

const ZONE_STROKE: Record<VisualZone, string> = {
  warmup: "var(--orato-claret-light)",
  building: "var(--orato-gold)",
  ideal: "var(--orato-verdigris)",
  wrapup: "var(--orato-ochre)",
  over: "var(--orato-bole)",
};

const ZONE_LABEL_KEY = {
  warmup: "zoneWarmup",
  building: "zoneBuilding",
  ideal: "zoneIdeal",
  wrapup: "zoneWrapUp",
  over: "zoneOver",
} as const;

interface RecordRingProps {
  /** Elapsed seconds (ticks once per second; the arc tweens between ticks). */
  elapsed: number;
  /** Ideal speaking window [from, to] in seconds. */
  ideal: [number, number];
  /** Seconds at which the ring is full — beyond this is the warning state. */
  maxSec: number;
  size?: number;
}

export function RecordRing({ elapsed, ideal, maxSec, size = 240 }: RecordRingProps) {
  const { t } = useI18n();
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2 - 2;
  const frac = Math.min(elapsed / maxSec, 1);
  const zone = ringZone(elapsed, ideal, maxSec);
  const visual = visualZone(elapsed, ideal, maxSec);

  const timeStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  /** Bronze boundary tick at a 0–1 fraction of the sweep (svg is pre-rotated -90°). */
  const tick = (fracPos: number, key: string) => {
    const angle = fracPos * 2 * Math.PI;
    const inner = r - 7;
    const outer = r + 7;
    const cx = size / 2;
    const cy = size / 2;
    return (
      <line
        key={key}
        x1={cx + inner * Math.cos(angle)}
        y1={cy + inner * Math.sin(angle)}
        x2={cx + outer * Math.cos(angle)}
        y2={cy + outer * Math.sin(angle)}
        stroke="var(--orato-bronze)"
        strokeWidth={2}
      />
    );
  };

  const glowClass = zone === "ideal" ? "ring-glow-ideal" : zone === "max" ? "ring-glow-over" : "";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${glowClass}`}
      role="timer"
      aria-label={timeStr}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Static track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--orato-wine-shadow)"
          strokeWidth={strokeWidth}
        />

        {/* Window-boundary ticks */}
        {tick(ideal[0] / maxSec, "tick-in")}
        {tick(Math.min(ideal[1] / maxSec, 1), "tick-out")}

        {/* Progress arc: 1s linear tween between ticks, 600ms colour tween between zones */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ZONE_STROKE[visual]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - frac}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 600ms ease",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="lectern tnum text-[44px] font-semibold leading-none text-vellum"
          data-testid="ring-elapsed"
        >
          {timeStr}
        </span>
        <span className="mt-1.5 text-xs" style={{ color: ZONE_STROKE[visual] }}>
          {t(ZONE_LABEL_KEY[visual])}
        </span>
      </div>
    </div>
  );
}
