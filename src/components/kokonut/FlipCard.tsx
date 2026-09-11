import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * Two-face 3D flip card. Both faces are stacked on one grid cell so the
 * card is always as tall as its tallest face — content can never clip
 * against a fixed height. Reduced motion swaps the flip for a cross-fade.
 * Interactive content like forms belongs *below* the card, never inside a
 * 3D-transformed face.
 *
 * Pass `onFlip` and the whole card becomes the trigger (a real button, so it
 * stays keyboard operable) — that is the word of the day, where tapping the
 * card is the point. Omit it and the card is inert scenery turned by a control
 * of its own elsewhere — that is the daily challenge, where the card is
 * content and "New challenge" is the affordance.
 */
export function FlipCard({
  flipped,
  onFlip,
  front,
  back,
  testId,
  label,
  faceClassName,
}: {
  flipped: boolean;
  /** Omit to render an inert card driven by an outside control. */
  onFlip?: () => void;
  front: ReactNode;
  back: ReactNode;
  testId?: string;
  label?: string;
  /** Replaces the default alternating claret/wine surfaces on both faces. */
  faceClassName?: string;
}) {
  const reduced = useReducedMotion();

  const faceBase =
    "box-border w-full rounded-(--radius-card) border border-bronze p-5 text-left";
  const frontFace = `${faceBase} ${faceClassName ?? "bg-claret"}`;
  const backFace = `${faceBase} ${faceClassName ?? "bg-wine"}`;

  /** A button only when it does something; otherwise a plain box. */
  const Shell = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) =>
    onFlip ? (
      <button
        type="button"
        onClick={onFlip}
        aria-expanded={flipped}
        aria-label={label}
        data-testid={testId}
        className="w-full text-left"
        style={style}
      >
        {children}
      </button>
    ) : (
      <div data-testid={testId} className="w-full text-left" style={style}>
        {children}
      </div>
    );

  if (reduced) {
    return (
      <Shell>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={flipped ? "back" : "front"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={flipped ? backFace : frontFace}
          >
            {flipped ? back : front}
          </motion.div>
        </AnimatePresence>
      </Shell>
    );
  }

  return (
    <Shell style={{ perspective: 1200 }}>
      <motion.div
        className="grid w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={frontFace}
          style={{ gridArea: "1 / 1", backfaceVisibility: "hidden" }}
          aria-hidden={flipped}
        >
          {front}
        </div>
        <div
          className={backFace}
          style={{ gridArea: "1 / 1", backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          aria-hidden={!flipped}
        >
          {back}
        </div>
      </motion.div>
    </Shell>
  );
}
