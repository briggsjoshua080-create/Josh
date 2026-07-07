import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { RefObject } from "react";

/**
 * Minimal live waveform: a strip of amber bars scrolling with the mic level.
 * Reads the latest level from a ref (no re-render per audio frame) and draws
 * on canvas via rAF. Purely decorative — hidden from assistive tech, skipped
 * entirely under reduced motion.
 */
export function Waveform({ levelRef }: { levelRef: RefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const BARS = 56;
    const levels: number[] = new Array(BARS).fill(0);
    let frame = 0;
    let raf = 0;

    const draw = () => {
      frame++;
      // Sample every 3rd frame (~20 Hz) so the strip scrolls at a calm pace.
      if (frame % 3 === 0) {
        levels.push(levelRef.current ?? 0);
        levels.shift();
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== Math.round(rect.width * dpr)) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
      }
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const gap = w / BARS;
      const barW = Math.max(2 * dpr, gap * 0.55);
      for (let i = 0; i < BARS; i++) {
        const level = levels[i];
        const barH = Math.max(2 * dpr, level * h * 0.92);
        // Newer bars glow brighter; the tail fades out toward the left.
        const alpha = 0.25 + 0.6 * (i / BARS);
        ctx.fillStyle = `rgba(233, 183, 100, ${alpha.toFixed(3)})`;
        const x = i * gap + (gap - barW) / 2;
        const y = (h - barH) / 2;
        const radius = barW / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, radius);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reduced, levelRef]);

  if (reduced) return null;
  return <canvas ref={canvasRef} className="h-10 w-full" aria-hidden="true" />;
}
