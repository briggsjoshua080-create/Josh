import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Two-face 3D flip card. Both faces are stacked on one grid cell so the
 * card is always as tall as its tallest face — content can never clip
 * against a fixed height. Reduced motion swaps the flip for a cross-fade.
 * The whole card is the flip trigger (a real button, so it stays keyboard
 * operable); interactive content like forms belongs *below* the card, never
 * inside a 3D-transformed face.
 */
export function FlipCard({
  flipped,
  onFlip,
  front,
  back,
  testId,
  label,
}: {
  flipped: boolean;
  onFlip: () => void;
  front: ReactNode;
  back: ReactNode;
  testId?: string;
  label?: string;
}) {
  const reduced = useReducedMotion();

  const faceBase =
    "box-border w-full rounded-(--radius-card) border border-bronze p-5 text-left";

  if (reduced) {
    return (
      <button
        type="button"
        onClick={onFlip}
        aria-expanded={flipped}
        aria-label={label}
        data-testid={testId}
        className="w-full text-left"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={flipped ? "back" : "front"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`${faceBase} ${flipped ? "bg-wine" : "bg-claret"}`}
          >
            {flipped ? back : front}
          </motion.div>
        </AnimatePresence>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-expanded={flipped}
      aria-label={label}
      data-testid={testId}
      className="w-full text-left"
      style={{ perspective: 1200 }}
    >
      <motion.div
        className="grid w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`${faceBase} bg-claret`}
          style={{ gridArea: "1 / 1", backfaceVisibility: "hidden" }}
          aria-hidden={flipped}
        >
          {front}
        </div>
        <div
          className={`${faceBase} bg-wine`}
          style={{ gridArea: "1 / 1", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          aria-hidden={!flipped}
        >
          {back}
        </div>
      </motion.div>
    </button>
  );
}
