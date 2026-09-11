import { useEffect, type CSSProperties } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { OratoMark } from "./OratoMark";
import { useI18n } from "@/lib/i18n";

/**
 * Launch sequence, in two steps.
 *
 *   1. The mark draws itself — the column top-down, then the orator reaching
 *      for it — gold strokes on a deep-wine ground (see OratoMark).
 *   2. It shrinks and rises to sit as a crest, and the name sets beneath it:
 *      ORATO lands letter by letter, each resolving out of a champagne spark,
 *      then one sheen travels across the word. "speak · review · improve"
 *      follows, wide and gold.
 *
 * Then the overlay fades over the app, which has been booting underneath the
 * whole time. 3.4s to onDone.
 *
 * The mark's final layout size is its *small* size; step one scales it up and
 * drops it to optical centre, so step two is one transform home rather than a
 * reflow. Nothing here animates a layout property.
 *
 * Under prefers-reduced-motion the finished composition renders on frame one
 * and hands off in 600ms. The CSS kill switch in theme.css zeroes durations
 * but not delays, so the animated classes are dropped entirely rather than
 * merely shortened.
 */

/** The whole timeline, in ms. One source of truth; the CSS carries no delays. */
const T = {
  /** Step one: 10 path groups, 85ms apart, 700ms each. */
  markDraw: 1465,
  /** Step one holds a beat before handing over. */
  handoff: 1700,
  handoffDur: 450,
  /** Step two. Letters overlap the handoff by 150ms so it reads as one move. */
  letters: 2000,
  letterStagger: 80,
  sheen: 2600,
  sheenStagger: 60,
  tagline: 2750,
  taglineSheen: 2900,
  fade: 3100,
  fadeDur: 300,
} as const;

const DONE_MS = T.fade + T.fadeDur; // 3400
const REDUCED_DONE_MS = 600;

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const WORD = "ORATO";

/** How much bigger the mark is while it draws, and how far down it sits. */
const MARK_SCALE = 2.3;
const MARK_DROP = 52;

export default function OratoSplash({ onDone }: { onDone?: () => void }) {
  const { t } = useI18n();
  const reduced = useReducedMotion();

  useEffect(() => {
    const id = setTimeout(() => onDone?.(), reduced ? REDUCED_DONE_MS : DONE_MS);
    return () => clearTimeout(id);
  }, [onDone, reduced]);

  const overlay: Transition = {
    duration: T.fadeDur / 1000,
    delay: T.fade / 1000,
    ease: "easeOut",
  };
  const handoff: Transition = {
    duration: T.handoffDur / 1000,
    delay: T.handoff / 1000,
    ease: EASE_OUT_EXPO,
  };

  const words = [t("splashSpeak"), t("splashReview"), t("splashImprove")];

  return (
    <motion.div
      style={styles.wrap}
      initial={{ opacity: 1 }}
      animate={reduced ? { opacity: 1 } : { opacity: 0 }}
      transition={reduced ? { duration: 0 } : overlay}
      /* Decorative: the app underneath is the real content and its header
         already carries the name. Nothing here is focusable, so no trap. */
      aria-hidden="true"
    >
      <motion.div
        style={styles.markGlow}
        initial={reduced ? false : { scale: MARK_SCALE, y: MARK_DROP }}
        animate={reduced ? {} : { scale: 1, y: 0 }}
        transition={handoff}
      >
        <OratoMark style={styles.mark} drawing={!reduced} />
      </motion.div>

      <div style={styles.word}>
        {WORD.split("").map((ch, i) => (
          <span
            key={i}
            className={reduced ? undefined : "orato-letter"}
            style={
              reduced
                ? styles.letterStill
                : ({
                    ["--land" as string]: `${T.letters + i * T.letterStagger}ms`,
                    ["--sheen" as string]: `${T.sheen + i * T.sheenStagger}ms`,
                  } as CSSProperties)
            }
          >
            {ch}
          </span>
        ))}
      </div>

      <div
        className={reduced ? undefined : "orato-tagline"}
        style={
          reduced
            ? { ...styles.tagline, color: "var(--orato-gold)" }
            : ({
                ...styles.tagline,
                ["--in" as string]: `${T.tagline}ms`,
                ["--sheen" as string]: `${T.taglineSheen}ms`,
              } as CSSProperties)
        }
      >
        {words.join(" · ")}
      </div>
    </motion.div>
  );
}

const styles: Record<
  "wrap" | "markGlow" | "mark" | "word" | "letterStill" | "tagline",
  CSSProperties
> = {
  wrap: {
    position: "fixed",
    inset: 0,
    /* Deeper than the surface ramp's wine so the gold keeps its contrast
       (7.97:1 at centre, 8.76:1 at the rim) — the reference's drama without
       its neutral black. */
    background:
      "radial-gradient(78% 64% at 50% 44%, var(--orato-deep-wine) 0%, color-mix(in srgb, var(--orato-deep-wine) 55%, var(--orato-obsidian)) 58%, var(--orato-obsidian) 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  markGlow: {
    /* Centred, no y-offset: functional light, not depth (DESIGN.md § Shape). */
    filter: "drop-shadow(0 0 30px color-mix(in srgb, var(--orato-gold) 24%, transparent))",
    lineHeight: 0,
    willChange: "transform",
  },
  mark: {
    width: 112,
    height: "auto",
    display: "block",
  },
  word: {
    marginTop: 20,
    fontFamily: "var(--font-logotype)",
    fontWeight: 500,
    fontSize: "min(13.5vw, 54px)",
    lineHeight: 1,
    /* Tight-set, the way the reference sets its mark — the air goes in the
       line below, not between these capitals. */
    letterSpacing: "0.01em",
    display: "flex",
  },
  letterStill: {
    display: "inline-block",
    color: "var(--orato-vellum)",
  },
  tagline: {
    marginTop: 16,
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.34em",
    paddingLeft: "0.34em",
    textTransform: "uppercase",
  },
};
