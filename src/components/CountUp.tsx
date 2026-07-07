import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

interface CountUpProps {
  value: number;
  /** Animate 0→value once on mount; false renders the final number immediately. */
  active?: boolean;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
}

/** Number that counts up on reveal — the XP/score moment. Honours reduced motion. */
export function CountUp({ value, active = true, duration = 0.8, delay = 0, prefix = "", suffix = "" }: CountUpProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(active && !reduced ? 0 : value);

  useEffect(() => {
    if (!active || reduced) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, active, reduced, duration, delay]);

  return (
    <>
      {prefix}
      {shown}
      {suffix}
    </>
  );
}
