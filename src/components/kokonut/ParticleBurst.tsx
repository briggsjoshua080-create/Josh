import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const PARTICLE_COLORS = ["var(--orato-gold)", "var(--orato-champagne)"];

/**
 * One-shot particle burst around its child — the XP-gain moment. Fires once
 * on mount; gold and champagne only. Renders nothing extra under reduced
 * motion.
 */
export function ParticleBurst({ children, count = 14 }: { children: ReactNode; count?: number }) {
  const reduced = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (i % 2) * 0.35;
        const distance = 28 + (i % 3) * 14;
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: i % 2 ? 3 : 4,
          color: PARTICLE_COLORS[i % 2],
          delay: 0.45 + (i % 5) * 0.04,
        };
      }),
    [count],
  );

  return (
    <span className="relative inline-flex">
      {children}
      {!reduced &&
        particles.map((p, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
            style={{ width: p.size, height: p.size, background: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.4 }}
            transition={{ duration: 0.9, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
    </span>
  );
}
