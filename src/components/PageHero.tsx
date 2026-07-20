import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * The page header card, styled after the reference "poster" layout: a
 * museum-poster panel up top holding the orator emblem, an organic S-curve
 * divider, then a solid wine footer carrying the title and a line of copy.
 * Two colours only — Dutch White panel, Wine footer — and the same orator
 * artwork used for the app icon, header logo and splash.
 */
export function PageHero({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  /** Optional control docked to the footer's right edge (e.g. a view toggle). */
  trailing?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const enter = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { type: "spring" as const, stiffness: 130, damping: 18 },
      };

  return (
    <motion.div
      {...enter}
      className="overflow-hidden rounded-[28px] border border-cream/50"
      data-testid="page-hero"
    >
      {/* Poster panel — Dutch White, the emblem centred with breathing room */}
      <div className="relative bg-cream px-6 pt-9 pb-11">
        <img
          src="/orato-logo.png"
          alt="Orato"
          width={132}
          height={132}
          draggable={false}
          className="mx-auto h-[132px] w-[132px] select-none rounded-[22px]"
          style={{ boxShadow: "0 10px 26px rgb(58 12 20 / 0.28)" }}
        />
        {/* Organic curved divider rising into the wine footer */}
        <svg
          className="absolute inset-x-0 bottom-0 h-[54px] w-full"
          viewBox="0 0 400 54"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0,54 L0,30 C86,56 176,8 268,26 C330,38 372,30 400,18 L400,54 Z"
            fill="#722F37"
          />
        </svg>
      </div>

      {/* Wine footer — serif title + supporting line */}
      <div className="bg-card px-6 pt-1 pb-6">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="lectern text-2xl font-semibold text-cream">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-cream/75">{subtitle}</p>}
          </div>
          {trailing && <div className="shrink-0 pb-1">{trailing}</div>}
        </div>
      </div>
    </motion.div>
  );
}
