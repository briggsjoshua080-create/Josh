import { motion, useReducedMotion } from "motion/react";

/**
 * Today-screen hero: a wine-label collage of three staggered, slightly-rotated
 * panels — microphone, soundwave, speech bubble — drawn in Dutch White strokes
 * on wine-tinted panels, with a big serif "O" watermark behind. Pure SVG, no
 * assets; everything stays inside the black/cream/wine family.
 */
export function TodayHero() {
  const reduced = useReducedMotion();

  const panel = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18, scale: 0.96 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: { type: "spring" as const, stiffness: 120, damping: 16, delay: 0.12 * i },
        };

  return (
    <div className="relative mx-auto h-52 max-w-sm select-none" aria-hidden="true">
      {/* Serif watermark — the label's monogram */}
      <span className="lectern pointer-events-none absolute -top-6 right-2 text-[11rem] leading-none font-semibold text-accent/10">
        O
      </span>

      {/* Microphone panel — the anchor */}
      <motion.div
        {...panel(0)}
        className="absolute left-1 top-3 h-44 w-32 -rotate-3 rounded-(--radius-card) border border-line bg-gradient-to-b from-primary/25 to-primary/5 p-3"
      >
        <svg viewBox="0 0 96 140" className="h-full w-full" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round">
          <rect x="30" y="12" width="36" height="62" rx="18" />
          <path d="M38 30 H58 M38 42 H58 M38 54 H58" strokeWidth="3" opacity="0.7" />
          <path d="M20 58 C20 82 34 92 48 92 C62 92 76 82 76 58" />
          <path d="M48 92 V116" />
          <path d="M30 122 H66" />
        </svg>
      </motion.div>

      {/* Soundwave panel — overlaps the mic */}
      <motion.div
        {...panel(1)}
        className="absolute left-24 top-0 h-28 w-44 rotate-2 rounded-(--radius-card) border border-line bg-surface/80 p-3"
      >
        <svg viewBox="0 0 160 88" className="h-full w-full" fill="none" strokeLinecap="round">
          <g stroke="var(--color-ink)" strokeWidth="5">
            <path d="M12 34 V54" />
            <path d="M28 24 V64" />
            <path d="M44 14 V74" opacity="0.9" />
            <path d="M60 28 V60" />
          </g>
          <g stroke="var(--color-accent)" strokeWidth="5">
            <path d="M76 8 V80" />
            <path d="M92 22 V66" />
            <path d="M108 34 V54" />
          </g>
          <g stroke="var(--color-ink)" strokeWidth="5" opacity="0.6">
            <path d="M124 28 V60" />
            <path d="M140 38 V50" />
            <path d="M152 42 V46" />
          </g>
        </svg>
      </motion.div>

      {/* Speech-bubble panel — tucked under the wave */}
      <motion.div
        {...panel(2)}
        className="absolute bottom-0 left-40 h-24 w-36 -rotate-2 rounded-(--radius-card) border border-line bg-gradient-to-br from-accent/15 to-primary/10 p-3"
      >
        <svg viewBox="0 0 120 72" className="h-full w-full" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 10 H106 C110 10 112 12 112 16 V46 C112 50 110 52 106 52 H44 L26 66 L30 52 H14 C10 52 8 50 8 46 V16 C8 12 10 10 14 10 Z" />
          <text
            x="60"
            y="42"
            textAnchor="middle"
            fill="var(--color-accent)"
            stroke="none"
            style={{ font: "italic 600 26px Georgia, serif" }}
          >
            “ ”
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
