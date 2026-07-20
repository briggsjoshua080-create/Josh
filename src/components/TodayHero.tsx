import { motion, useReducedMotion } from "motion/react";

/**
 * Today-screen hero: one large rounded wine card with a single clear focus —
 * the circular orator mark, the same artwork as the home-screen icon and
 * splash — ringed in gold with a soft glow, generous breathing room around it.
 */
export function TodayHero() {
  const reduced = useReducedMotion();

  const enter = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 18, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { type: "spring" as const, stiffness: 120, damping: 16 },
      };

  return (
    <motion.div
      {...enter}
      className="box box-shade-a relative mx-auto flex max-w-sm flex-col items-center overflow-hidden rounded-[30px] px-8 py-9"
      aria-hidden="true"
    >
      {/* Soft gold wash behind the mark */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
        style={{
          background: "radial-gradient(60% 46% at 50% 40%, rgb(201 168 118 / 0.14) 0%, transparent 100%)",
        }}
      />
      <img
        src="/orato-icon.svg"
        alt=""
        width={152}
        height={152}
        draggable={false}
        className="relative h-38 w-38 select-none rounded-full border border-gold/60"
        style={{ boxShadow: "0 0 44px rgb(201 168 118 / 0.22)" }}
      />
      <span className="lectern relative mt-5 text-sm italic text-gold/80">ars bene dicendi</span>
    </motion.div>
  );
}
