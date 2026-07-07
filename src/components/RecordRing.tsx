/**
 * Live-recording circular timer. The full sweep maps 0 → maxSec; the track is
 * painted in three time zones (build-up: dim amber, ideal window: green→amber
 * gradient, overtime: amber→red gradient) and the progress arc fills smoothly
 * on top, changing color with the zone the speaker is currently in. Elapsed
 * time sits in the center in large amber type.
 */

export type RingZone = "buildup" | "ideal" | "over" | "max";

export function ringZone(elapsed: number, ideal: [number, number], maxSec: number): RingZone {
  if (elapsed >= maxSec) return "max";
  if (elapsed > ideal[1]) return "over";
  if (elapsed >= ideal[0]) return "ideal";
  return "buildup";
}

const ZONE_STROKE: Record<RingZone, string> = {
  buildup: "var(--color-accent-dim)",
  ideal: "var(--color-accent)",
  over: "var(--color-warn)",
  max: "var(--color-bad)",
};

interface RecordRingProps {
  /** Elapsed seconds (ticks once per second; the arc tweens between ticks). */
  elapsed: number;
  /** Ideal speaking window [from, to] in seconds. */
  ideal: [number, number];
  /** Seconds at which the ring is full — beyond this is the warning state. */
  maxSec: number;
  size?: number;
}

export function RecordRing({ elapsed, ideal, maxSec, size = 264 }: RecordRingProps) {
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2 - 2;
  const frac = Math.min(elapsed / maxSec, 1);
  const zone = ringZone(elapsed, ideal, maxSec);

  const idealStart = ideal[0] / maxSec;
  const idealEnd = Math.min(ideal[1] / maxSec, 1);

  const timeStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  /** One zone segment of the background track (circle normalized to pathLength 1). */
  const seg = (from: number, to: number, stroke: string, opacity: number, key: string) => (
    <circle
      key={key}
      cx={size / 2}
      cy={size / 2}
      r={r}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="butt"
      pathLength={1}
      strokeDasharray={`${Math.max(to - from, 0)} ${1 - Math.max(to - from, 0)}`}
      strokeDashoffset={-from}
      opacity={opacity}
    />
  );

  const glowClass = zone === "ideal" ? "ring-glow-ideal" : zone === "max" ? "ring-glow-over" : "";

  return (
    <div
      className={`relative inline-flex items-center justify-center ${glowClass}`}
      role="timer"
      aria-label={timeStr}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-ideal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-ok)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
          <linearGradient id="ring-over" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-warn)" />
            <stop offset="100%" stopColor="var(--color-bad)" />
          </linearGradient>
        </defs>

        {/* Zone track: build-up / ideal window / overtime */}
        {seg(0, idealStart, "var(--color-accent-dim)", 0.18, "z-build")}
        {seg(idealStart, idealEnd, "url(#ring-ideal)", 0.32, "z-ideal")}
        {seg(idealEnd, 1, "url(#ring-over)", 0.22, "z-over")}

        {/* Progress arc: 1s linear tween between ticks keeps the sweep smooth */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ZONE_STROKE[zone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - frac}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 400ms ease",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="lectern tnum text-[3.25rem] font-semibold leading-none text-accent"
          data-testid="ring-elapsed"
        >
          {timeStr}
        </span>
      </div>
    </div>
  );
}
