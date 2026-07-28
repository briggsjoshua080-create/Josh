import { useEffect, type CSSProperties } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";

/**
 * Launch splash — the logo forming itself on a deep wine ground:
 *   1. a clock-hand sweep uncovers the emblem from 12 o'clock, clockwise
 *   2. once it closes the circle the whole mark settles 96% → 100%
 *   3. 200ms later "orato" fades and slides up beneath it, in gold
 * Then the overlay fades out over the booted app. Total ≈2.35s to onDone.
 *
 * The sweep is a conic-gradient mask driven by the --sweep custom property,
 * animated by Motion. A clipPath can only iris outwards from the centre; a
 * conic mask is the one that actually reads as a hand going round the dial.
 *
 * Under prefers-reduced-motion nothing animates: the finished state (full
 * emblem + wordmark) renders on the first frame and hands off quickly.
 */
const GOLD = "#C9A876";

/** Timeline, in seconds. Kept here so the sequence stays readable. */
const SWEEP_S = 1.35;
const SETTLE_S = 0.4;
const WORD_GAP_S = 0.2;
const WORD_S = 0.4;
const FADE_S = 0.3;
const DONE_MS = (SWEEP_S + SETTLE_S + WORD_GAP_S + WORD_S + FADE_S) * 1000; // 2350
const REDUCED_DONE_MS = 600;

/**
 * Opaque up to --sweep, transparent after. At 360deg the transparent stop
 * clamps back to 360deg, leaving the mark fully painted — so the resting
 * state is correct even if the property never animates.
 */
const SWEEP_MASK = "conic-gradient(from 0deg at 50% 50%, #000 var(--sweep), transparent 0deg)";

const EASE_OUT_QUINT = [0.22, 1, 0.36, 1] as const;

export default function OratoSplash({ onDone }: { onDone?: () => void }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), reduced ? REDUCED_DONE_MS : DONE_MS);
    return () => clearTimeout(t);
  }, [onDone, reduced]);

  const sweep: Transition = { duration: SWEEP_S, ease: "linear" };
  const settle: Transition = { duration: SETTLE_S, delay: SWEEP_S, ease: EASE_OUT_QUINT };
  const word: Transition = {
    duration: WORD_S,
    delay: SWEEP_S + SETTLE_S + WORD_GAP_S,
    ease: EASE_OUT_QUINT,
  };
  const overlay: Transition = {
    duration: FADE_S,
    delay: SWEEP_S + SETTLE_S + WORD_GAP_S + WORD_S,
    ease: "easeOut",
  };

  return (
    <motion.div
      style={styles.wrap}
      initial={{ opacity: 1 }}
      animate={reduced ? { opacity: 1 } : { opacity: 0 }}
      transition={reduced ? { duration: 0 } : overlay}
      aria-label="Orato"
      role="img"
    >
      {/* The glow lives on a wrapper: filters resolve before masks, so a
          drop-shadow on the masked element itself would trace the square
          source image instead of the sweep. */}
      <div style={styles.glow}>
        <motion.div
          style={{
            ...styles.mark,
            // Typed as a CSS custom property; Motion interpolates the angle.
            ["--sweep" as string]: reduced ? "360deg" : "0deg",
            WebkitMaskImage: SWEEP_MASK,
            maskImage: SWEEP_MASK,
          }}
          initial={reduced ? false : { scale: 0.96 }}
          animate={reduced ? {} : { ["--sweep" as string]: "360deg", scale: 1 }}
          transition={{ "--sweep": sweep, scale: settle } as Transition}
        >
          <img
            src="/icons/icon-512.png"
            alt=""
            width={512}
            height={512}
            draggable={false}
            style={styles.img}
          />
        </motion.div>
      </div>

      <motion.div
        style={styles.word}
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={reduced ? {} : { opacity: 1, y: 0 }}
        transition={word}
      >
        orato
      </motion.div>
    </motion.div>
  );
}

const styles: Record<"wrap" | "glow" | "mark" | "img" | "word", CSSProperties> = {
  wrap: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(72% 62% at 50% 42%, #4A1420 0%, #350D16 62%, #260810 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  glow: {
    filter: "drop-shadow(0 0 34px rgb(201 168 118 / 0.28))",
    lineHeight: 0,
  },
  mark: {
    width: "min(62vw, 260px)",
    aspectRatio: "1 / 1",
    // clip-path, not border-radius: under a mask the child's border-radius
    // leaves the source PNG's square corners showing through the sweep.
    clipPath: "circle(50% at 50% 50%)",
  },
  img: {
    width: "100%",
    height: "100%",
    display: "block",
    userSelect: "none",
  },
  word: {
    marginTop: 26,
    fontFamily: '"Newsreader Variable", ui-serif, Georgia, serif',
    letterSpacing: "0.4em",
    paddingLeft: "0.4em",
    fontSize: 26,
    color: GOLD,
  },
};
