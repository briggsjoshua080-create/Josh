import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface CardDeckProps<T> {
  items: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  /** Rendered under each card's content (e.g. a "practice" CTA). */
  renderAction: (item: T) => ReactNode;
}

/**
 * Vertical snap deck: every card is a full-height snap slide inside its own
 * scroller, so swiping up/down moves exactly one card at a time
 * (scroll-snap-stop: always) and every card in the library is reachable by
 * simply continuing to scroll. Arrows + counter give a non-gesture path,
 * which doubles as the reduced-motion/keyboard fallback.
 */
export function CardDeck<T>({ items, keyOf, renderCard, renderAction }: CardDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const n = items.length;

  // The counter follows whichever card the scroller has snapped to.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => {
      const i = Math.round(el.scrollTop / el.clientHeight);
      setIndex(Math.max(0, Math.min(n - 1, i)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [n]);

  if (n === 0) return null;

  function go(dir: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(n - 1, index + dir));
    el.scrollTo({ top: next * el.clientHeight, behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        className="deck-scroller h-[min(65dvh,540px)] overflow-y-auto rounded-(--radius-card)"
        data-testid="deck-scroller"
      >
        {items.map((item) => (
          <div
            key={keyOf(item)}
            className="deck-card flex h-full flex-col box p-6"
          >
            <div className="min-h-0 flex-1 overflow-hidden">{renderCard(item)}</div>
            {renderAction(item)}
          </div>
        ))}
      </div>

      {/* Non-gesture navigation + position */}
      <div className="mt-4 flex items-center justify-center gap-6">
        <DeckArrow dir="up" onClick={() => go(-1)} disabled={index === 0} />
        <span className="tnum text-sm text-muted">
          {index + 1} / {n}
        </span>
        <DeckArrow dir="down" onClick={() => go(1)} disabled={index === n - 1} />
      </div>
    </div>
  );
}

function DeckArrow({ dir, onClick, disabled }: { dir: "up" | "down"; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "up" ? "Previous" : "Next"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold/70 transition-colors hover:text-gold hover:bg-card disabled:opacity-35"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === "up" ? <path d="M5 15l7-7 7 7" /> : <path d="M5 9l7 7 7-7" />}
      </svg>
    </button>
  );
}
