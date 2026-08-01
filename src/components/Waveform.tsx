import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { RefObject } from "react";

const BARS = 32;

/**
 * Live level strip: 32 gold DOM bars (3px wide, 4px gap) scrolling with the
 * mic level. Reads the latest level scalar from a ref (the only signal the
 * frozen audio layer exposes — no new audio APIs) and writes scaleY
 * transforms directly on the bar nodes via rAF, so nothing re-renders per
 * frame. Purely decorative — hidden from assistive tech, skipped entirely
 * under reduced motion.
 */
export function Waveform({ levelRef }: { levelRef: RefObject<number> }) {
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const levels: number[] = new Array(BARS).fill(0);
    let frame = 0;
    let raf = 0;

    const draw = () => {
      frame++;
      // Sample every 3rd frame (~20 Hz) so the strip scrolls at a calm pace.
      if (frame % 3 === 0) {
        levels.push(levelRef.current ?? 0);
        levels.shift();
        for (let i = 0; i < BARS; i++) {
          const bar = barRefs.current[i];
          if (bar) bar.style.transform = `scaleY(${Math.max(0.08, levels[i])})`;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reduced, levelRef]);

  if (reduced) return null;
  return (
    <div className="flex h-10 w-full items-center justify-center" aria-hidden="true" style={{ gap: 4 }}>
      {Array.from({ length: BARS }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          className="h-full rounded-full bg-gold"
          style={{ width: 3, opacity: 0.7, transform: "scaleY(0.08)", transformOrigin: "center" }}
        />
      ))}
    </div>
  );
}
