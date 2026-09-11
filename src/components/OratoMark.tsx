import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

/**
 * The orator and the lectern column as live strokes — the same 20 paths the
 * app icon is built from (public/icons/orato-emblem.svg), minus the wine disc
 * and the double gold ring. Naked on the ground, the mark can draw itself.
 *
 * The draw-on is CSS, not Motion: 20 staggered path animations are cheaper as
 * one keyframe + a per-path `--i` than as 20 components mounting while the app
 * is still booting. `pathLength="1"` normalises every path to a unit length so
 * a 280-unit flute and a 26-unit bun share one `1 → 0` dashoffset keyframe —
 * no getTotalLength() pass, and no first frame showing the finished mark.
 *
 * Groups draw in the order a hand would: the column top-down, then the head,
 * then the arm reaching for it, then the robe. See .orato-mark-path in
 * theme.css for the timing.
 */

/** Draw order. Each entry is one group; every path in it starts together. */
const GROUPS: { d: string; w?: number }[][] = [
  // 0 — the column's capital
  [{ d: "M360 150 C360 136 366 130 378 130 H412 C424 130 430 136 430 150" }],
  // 1 — the shaft falls
  [{ d: "M372 150 V430" }, { d: "M418 150 V430" }],
  // 2 — flutes
  [
    { d: "M388 162 V420", w: 6 },
    { d: "M402 162 V420", w: 6 },
  ],
  // 3 — base
  [{ d: "M360 430 H430" }],
  // 4 — head and face
  [
    {
      d: "M214 214 C200 202 196 170 208 150 C215 135 230 127 244 132 C254 136 258 143 258 151 L272 188 C274 194 271 199 264 199 L257 205 C262 212 263 221 256 231 C249 243 233 245 224 238 C217 233 215 224 215 214 Z",
    },
  ],
  // 5 — bun and hairline
  [
    { d: "M198 150 m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0", w: 8 },
    { d: "M212 154 C226 145 246 147 256 156", w: 7 },
  ],
  // 6 — neck, shoulder, the arm reaching the column
  [
    { d: "M222 240 L216 266" },
    { d: "M256 232 C258 248 254 258 262 270" },
    { d: "M262 272 C300 264 324 240 332 210 C338 188 346 172 356 162" },
    { d: "M356 162 C363 155 370 154 375 160", w: 8 },
  ],
  // 7 — the robe's outline
  [
    { d: "M216 266 C188 274 168 292 160 322" },
    { d: "M262 270 C282 300 292 336 288 372" },
  ],
  // 8 — folds
  [
    { d: "M206 288 C220 320 244 342 258 372", w: 6 },
    { d: "M182 306 C214 326 246 336 276 332", w: 6 },
    { d: "M164 322 C176 348 202 360 232 352" },
    { d: "M232 344 L232 362", w: 8 },
  ],
  // 9 — the hem closes it
  [{ d: "M160 372 C200 392 250 390 288 372", w: 9 }],
];

export function OratoMark({
  className = "",
  style,
  drawing = true,
}: {
  className?: string;
  style?: CSSProperties;
  /** false renders the finished mark with no draw-on (post-sequence, tests). */
  drawing?: boolean;
}) {
  const reduced = useReducedMotion();
  const animate = drawing && !reduced;

  let i = 0;
  return (
    <svg
      viewBox="152 119 288 320"
      className={className}
      style={style}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* userSpaceOnUse is load-bearing: the default objectBoundingBox
            collapses to a zero-width box on the perfectly vertical flutes and
            drops those paths from the render entirely. */}
        <linearGradient id="orato-mark-gold" gradientUnits="userSpaceOnUse" x1="295" y1="119" x2="295" y2="439">
          <stop offset="0%" style={{ stopColor: "var(--orato-champagne)" }} />
          <stop offset="46%" style={{ stopColor: "var(--orato-gold)" }} />
          {/* The artwork's metal falls off at the foot; mixed from tokens so no
              raw hex leaves tokens.css, and kept above the 3:1 non-text floor. */}
          <stop
            offset="100%"
            style={{ stopColor: "color-mix(in srgb, var(--orato-gold) 60%, var(--orato-bronze))" }}
          />
        </linearGradient>
      </defs>

      <g
        stroke="url(#orato-mark-gold)"
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GROUPS.map((group, g) =>
          group.map((p) => (
            <path
              key={i++}
              d={p.d}
              pathLength={1}
              strokeWidth={p.w}
              className={animate ? "orato-mark-path" : undefined}
              style={animate ? ({ ["--i" as string]: g } as CSSProperties) : undefined}
            />
          )),
        )}
      </g>
    </svg>
  );
}
