import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Animate the sweep + count-up once on mount (the score-reveal set piece). */
  reveal?: boolean;
}

/** Gold score ring — the spotlight falls on what was earned. */
export function ProgressRing({ value, size = 148, strokeWidth = 9, label, reveal = false }: ProgressRingProps) {
  const reduced = useReducedMotion();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const [shown, setShown] = useState(reveal && !reduced ? 0 : value);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!reveal || reduced) {
      setShown(value);
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(circumference * (1 - value / 100));
      }
      return;
    }
    const controls = animate(0, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        setShown(Math.round(v));
        if (circleRef.current) {
          circleRef.current.style.strokeDashoffset = String(circumference * (1 - v / 100));
        }
      },
    });
    return () => controls.stop();
  }, [value, reveal, reduced, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center" role="img" aria-label={`${label ?? "Score"}: ${value}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth={strokeWidth}
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (reveal && !reduced ? 0 : value) / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum text-4xl font-semibold text-ink leading-none">{shown}</span>
        {label && <span className="mt-1 text-xs text-muted">{label}</span>}
      </div>
    </div>
  );
}
