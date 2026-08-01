import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * AI-thinking state: cycles short coach phrases, gold on obsidian.
 * The 45-second ceiling on the round-trip is enforced by the fetch layer
 * (AbortSignal.timeout in lib/feedback.ts) — when it fires, the caller
 * swaps this loader for the retry card. Reduced motion pins the first phrase.
 */
export function AiTextLoading({ phrases, intervalMs = 2400 }: { phrases: string[]; intervalMs?: number }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setIndex((n) => (n + 1) % phrases.length), intervalMs);
    return () => clearInterval(timer);
  }, [phrases.length, intervalMs, reduced]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="box-border flex min-h-24 w-full items-center justify-center rounded-(--radius-card) bg-obsidian px-6 py-8"
    >
      {reduced ? (
        <span className="text-sm text-gold">{phrases[0]}</span>
      ) : (
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            className="text-sm text-gold"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {phrases[index]}
          </motion.span>
        </AnimatePresence>
      )}
    </div>
  );
}
