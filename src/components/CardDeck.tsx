import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import type { ReactNode } from "react";

interface CardDeckProps<T> {
  items: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  /** Rendered under the top card's content (e.g. a "practice" CTA). */
  renderAction: (item: T) => ReactNode;
}

const SWIPE_OFFSET = 90;
const SWIPE_VELOCITY = 500;
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

/**
 * Swipeable card deck: swipe LEFT for the next card, swipe RIGHT for the
 * previous one (velocity-aware), stacked cards peek behind. Arrows + counter
 * give a non-gesture path, which doubles as the reduced-motion/keyboard
 * fallback. The exiting card is made click-through immediately so rapid
 * consecutive swipes always land on the fresh top card.
 */
export function CardDeck<T>({ items, keyOf, renderCard, renderAction }: CardDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const reduced = useReducedMotion();

  if (items.length === 0) return null;
  const n = items.length;
  const wrap = (i: number) => ((i % n) + n) % n;
  const at = (offset: number) => items[wrap(index + offset)];

  /** dir 1 = next (card flies out left), dir -1 = previous (flies out right). */
  function go(dir: 1 | -1) {
    setExitX(dir === 1 ? -320 : 320);
    setIndex((i) => wrap(i + dir));
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    if (Math.abs(offset.x) > SWIPE_OFFSET || Math.abs(velocity.x) > SWIPE_VELOCITY) {
      // Finger moved left → next card; finger moved right → previous card.
      go(offset.x + velocity.x * 0.2 < 0 ? 1 : -1);
    }
  }

  const top = at(0);

  return (
    <div>
      <div className="relative h-[420px] select-none" style={{ touchAction: "pan-y" }}>
        {/* Stack shadows: two cards peeking behind */}
        {n > 2 && <StackCard depth={2} key={`b2-${keyOf(at(2))}`} reduced={reduced ?? false} />}
        {n > 1 && <StackCard depth={1} key={`b1-${keyOf(at(1))}`} reduced={reduced ?? false} />}

        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={keyOf(top)}
            className="absolute inset-0 flex cursor-grab flex-col rounded-(--radius-card) border border-line bg-surface p-6 active:cursor-grabbing"
            drag="x"
            dragSnapToOrigin
            dragElastic={0.7}
            onDragEnd={onDragEnd}
            initial={reduced ? { opacity: 0 } : { scale: 0.94, y: 14, opacity: 0.6 }}
            animate={reduced ? { opacity: 1 } : { scale: 1, y: 0, x: 0, opacity: 1, rotate: 0 }}
            // pointerEvents applies instantly on exit: the dying card must never
            // swallow the touches meant for the card revealed underneath it.
            exit={
              reduced
                ? { opacity: 0, pointerEvents: "none", transition: { duration: 0.1 } }
                : { x: exitX, rotate: exitX > 0 ? 8 : -8, opacity: 0, pointerEvents: "none", transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } }
            }
            transition={SPRING}
            whileDrag={reduced ? undefined : { rotate: 0.5, scale: 1.01 }}
          >
            <div className="pointer-events-none flex-1">{renderCard(top)}</div>
            <div onPointerDownCapture={(e) => e.stopPropagation()}>{renderAction(top)}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Non-gesture navigation + position */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <DeckArrow dir="left" onClick={() => go(-1)} />
        <span className="tnum text-sm text-muted">
          {index + 1} / {n}
        </span>
        <DeckArrow dir="right" onClick={() => go(1)} />
      </div>
    </div>
  );
}

function StackCard({ depth, reduced }: { depth: 1 | 2; reduced: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-(--radius-card) border border-line bg-surface"
      initial={false}
      animate={{ scale: 1 - depth * 0.05, y: depth * 13, opacity: 1 - depth * 0.35 }}
      transition={reduced ? { duration: 0 } : SPRING}
      style={{ zIndex: -depth }}
    />
  );
}

function DeckArrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Previous" : "Next"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:text-ink hover:bg-surface"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}
