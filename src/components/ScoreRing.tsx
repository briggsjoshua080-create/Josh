import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { scoreColorVar } from "@/lib/scoreColor";
import { resolveToken } from "@/lib/cssTokens";
import { letterGrade } from "@/lib/grade";
import { AnimatedScore } from "@/components/AnimatedScore";
import { GradeLetter } from "@/components/GradeLetter";

/** Spring shared with AnimatedScore, so the arc and the digits settle together. */
const SPRING = { stiffness: 60, damping: 18, mass: 1 };

interface ScoreRingProps {
  /** 0–100 overall score. */
  value: number;
  /** false renders the final state without sweeping (revisiting an old session). */
  active?: boolean;
  size?: number;
}

/**
 * The feedback hero: the overall score inside a ring that sweeps 0 → score.
 * One spring drives both the arc and its colour, which walks the score bands
 * (weak → fair → good → excellent) exactly as the count-up in AnimatedScore
 * does — same input, same thresholds, so the two never disagree mid-flight.
 */
export function ScoreRing({ value, active = true, size = 208 }: ScoreRingProps) {
  const reduced = useReducedMotion();
  const still = reduced || !active;

  const mv = useMotionValue(still ? value : 0);
  const spring = useSpring(mv, SPRING);

  const bands = useMemo(
    () => ({
      weak: resolveToken("--score-weak"),
      fair: resolveToken("--score-fair"),
      good: resolveToken("--score-good"),
      excellent: resolveToken("--score-excellent"),
    }),
    [],
  );
  const stroke = useTransform(
    spring,
    [0, 59.99, 60, 74.99, 75, 89.99, 90, 100],
    [bands.weak, bands.weak, bands.fair, bands.fair, bands.good, bands.good, bands.excellent, bands.excellent],
  );
  // pathLength={1} normalises the circumference, so the arc is a plain fraction.
  const dashOffset = useTransform(spring, (v) => 1 - Math.max(0, Math.min(100, v)) / 100);

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2 - 1;
  const grade = letterGrade(value);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(value)} out of 100, grade ${grade}`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--orato-wine-shadow)"
          strokeWidth={strokeWidth}
        />
        {still ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={scoreColorVar(value)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - Math.max(0, Math.min(100, value)) / 100}
          />
        ) : (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            style={{ stroke, strokeDashoffset: dashOffset }}
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span className="lectern tnum text-[4rem] font-semibold leading-none">
          <AnimatedScore value={value} active={active} />
        </span>
        <GradeLetter grade={grade} color={scoreColorVar(value)} className="lectern text-xl leading-none" />
      </div>
    </div>
  );
}
