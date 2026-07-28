import { motion, useReducedMotion } from "motion/react";

/**
 * Today-screen hero: one tall rounded card, parchment above and wine below,
 * split by a soft wave. The logo tile sits in the parchment half; the day
 * heading sits in the wine half.
 *
 * The wave path is traced from the reference screen — it crosses at roughly
 * 60–65% of the card height, dipping left of centre and cresting right of it.
 * The SVG is stretched with preserveAspectRatio="none", so the curve keeps its
 * proportions at any card size.
 */
const WAVE =
  "M0,0 H100 V59.3 " +
  "C 94,59 88,63 81,63.2 " +
  "C 72,63.4 66,59.9 61,59.8 " +
  "C 48,59.6 33,64.2 19,65.1 " +
  "C 12,65.5 6,63.6 0,62.8 Z";

export function TodayHero({ day, caption }: { day: string; caption: string }) {
  const reduced = useReducedMotion();

  const enter = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 18, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { type: "spring" as const, stiffness: 120, damping: 16 },
      };

  return (
    <motion.div
      {...enter}
      className="relative mx-auto flex aspect-[7/6] w-full max-w-sm flex-col overflow-hidden rounded-[30px] border border-gold/60"
      style={{ background: "var(--color-card)" }}
    >
      {/* Parchment half, cut by the wave */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path d={WAVE} fill="var(--color-parchment)" />
      </svg>

      {/* The mark, centred in the parchment */}
      <div className="relative flex h-[60%] items-center justify-center">
        <img
          src="/icons/icon-512.png"
          alt=""
          width={132}
          height={132}
          draggable={false}
          className="h-[132px] w-[132px] select-none"
          style={{ borderRadius: "23%", boxShadow: "0 14px 34px rgb(35 10 15 / 0.42)" }}
        />
      </div>

      {/* Day heading, in the wine */}
      <div className="relative flex flex-1 flex-col justify-center px-7">
        <h1 className="lectern text-3xl font-semibold text-ink">{day}</h1>
        <p className="mt-1 text-sm text-ink/75">{caption}</p>
      </div>
    </motion.div>
  );
}
