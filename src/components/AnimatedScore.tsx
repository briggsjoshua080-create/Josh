import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { scoreColorVar } from "@/lib/scoreColor";
import { resolveToken } from "@/lib/cssTokens";

/**
 * Motion-driven score count-up: a spring on a MotionValue rendered directly,
 * so the number ticks without per-frame React re-renders. The colour walks
 * the score bands (weak → fair → good → excellent) as the spring passes each
 * threshold. Reduced motion (or active=false) renders the final state.
 */
export function AnimatedScore({
  value,
  active = true,
  className,
}: {
  value: number;
  active?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18, mass: 1 });
  const rounded = useTransform(spring, (v) => Math.round(v));

  // Band colours resolved once — Motion interpolates concrete colours, not var().
  const bands = useMemo(
    () => ({
      weak: resolveToken("--score-weak"),
      fair: resolveToken("--score-fair"),
      good: resolveToken("--score-good"),
      excellent: resolveToken("--score-excellent"),
    }),
    [],
  );
  const color = useTransform(
    spring,
    [0, 59.99, 60, 74.99, 75, 89.99, 90, 100],
    [bands.weak, bands.weak, bands.fair, bands.fair, bands.good, bands.good, bands.excellent, bands.excellent],
  );

  useEffect(() => {
    mv.set(value);
  }, [value, mv]);

  if (reduced || !active) {
    return (
      <span className={className} style={{ color: scoreColorVar(value) }}>
        {Math.round(value)}
      </span>
    );
  }
  return (
    <motion.span className={className} style={{ color }}>
      {rounded}
    </motion.span>
  );
}
