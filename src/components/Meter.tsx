import { motion, useReducedMotion } from "motion/react";

interface MeterProps {
  /** Marker position, 0–1 along the track. */
  value: number;
  /** Optional shaded target region, 0–1 fractions of the track. */
  band?: [number, number];
  leftLabel: string;
  rightLabel: string;
  /** Accessible description, e.g. "Confidence: 72/100". */
  ariaLabel: string;
}

/** Horizontal scale (Tentative → Commanding, Slow → Fast) with one amber marker. */
export function Meter({ value, band, leftLabel, rightLabel, ariaLabel }: MeterProps) {
  const reduced = useReducedMotion();
  const pos = Math.max(0, Math.min(1, value));

  return (
    <div role="img" aria-label={ariaLabel}>
      <div className="relative h-1.5 rounded-full bg-surface-2">
        {band && (
          <div
            className="absolute inset-y-0 rounded-full bg-ink/10"
            style={{
              left: `${Math.max(0, band[0]) * 100}%`,
              width: `${(Math.min(1, band[1]) - Math.max(0, band[0])) * 100}%`,
            }}
          />
        )}
        <motion.div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          initial={reduced ? { left: `${pos * 100}%` } : { left: "0%" }}
          animate={{ left: `${pos * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-faint">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
