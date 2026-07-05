import { motion, useReducedMotion } from "motion/react";

interface ScoreBarProps {
  label: string;
  /** 0–100, or null when the category wasn't scored (offline). */
  value: number | null;
  delay?: number;
}

export function ScoreBar({ label, value, delay = 0 }: ScoreBarProps) {
  const reduced = useReducedMotion();
  return (
    <div className="flex items-center gap-3">
      <span className="w-36 shrink-0 text-sm text-muted">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
        {value !== null && (
          <motion.div
            className="h-full rounded-full"
            style={{ background: value >= 85 ? "var(--color-accent)" : value >= 60 ? "var(--color-accent-dim)" : "var(--color-bad)" }}
            initial={reduced ? { width: `${value}%` } : { width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </div>
      <span className="tnum w-8 text-right text-sm font-medium text-ink">
        {value === null ? "—" : value}
      </span>
    </div>
  );
}
