import React, { useEffect } from "react";

/**
 * Launch splash — a six-beat sequence on a deep wine ground, all in gold:
 *   1. a small gold dot appears at centre
 *   2. the dot hands off to a thin gold circle outline drawing itself
 *   3. the orator sketch fades in faintly inside the circle
 *   4. the sketch's strokes draw themselves in fully
 *   5. the whole graphic gets a soft gold glow pulse
 *   6. "orato" fades in below in serif gold
 * Total ≈1.8s, then the overlay fades out over the booted app; onDone at ~2s.
 * Honours prefers-reduced-motion (everything renders complete immediately).
 * The sketch reuses the exact paths of public/orato-icon.svg — one artwork
 * everywhere: home-screen icon, header logo, splash.
 */
const GOLD = "#C9A876";
const DONE_MS = 2050;

/** The orator + column line art from public/orato-icon.svg (512-box coords). */
const ORATOR_PATHS: Array<{ d: string; w?: number }> = [
  { d: "M372 150 V430" },
  { d: "M418 150 V430" },
  { d: "M388 162 V420", w: 6 },
  { d: "M402 162 V420", w: 6 },
  { d: "M360 150 C360 136 366 130 378 130 H412 C424 130 430 136 430 150" },
  { d: "M360 430 H430" },
  { d: "M214 214 C200 202 196 170 208 150 C215 135 230 127 244 132 C254 136 258 143 258 151 L272 188 C274 194 271 199 264 199 L257 205 C262 212 263 221 256 231 C249 243 233 245 224 238 C217 233 215 224 215 214 Z" },
  { d: "M198 150 m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0", w: 8 },
  { d: "M212 154 C226 145 246 147 256 156", w: 7 },
  { d: "M222 240 L216 266" },
  { d: "M256 232 C258 248 254 258 262 270" },
  { d: "M262 272 C300 264 324 240 332 210 C338 188 346 172 356 162" },
  { d: "M356 162 C363 155 370 154 375 160", w: 8 },
  { d: "M216 266 C188 274 168 292 160 322" },
  { d: "M262 270 C282 300 292 336 288 372" },
  { d: "M206 288 C220 320 244 342 258 372", w: 6 },
  { d: "M182 306 C214 326 246 336 276 332", w: 6 },
  { d: "M164 322 C176 348 202 360 232 352" },
  { d: "M232 344 L232 362", w: 8 },
  { d: "M160 372 C200 392 250 390 288 372", w: 9 },
];

export default function OratoSplash({ onDone }: { onDone?: () => void }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => onDone && onDone(), reduced ? 600 : DONE_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="orato-splash" style={styles.wrap}>
      <style>{css}</style>
      <svg viewBox="0 0 560 560" className="orato-splash-art" style={styles.svg} aria-label="Orato">
        {/* 1 — the gold dot */}
        <circle className="orato-dot" cx="280" cy="280" r="11" fill={GOLD} />
        {/* 2 — the thin circle outline drawing itself */}
        <circle
          className="orato-ring"
          cx="280"
          cy="280"
          r="248"
          pathLength="1"
          fill="none"
          stroke={GOLD}
          strokeWidth="6"
          strokeLinecap="round"
          transform="rotate(-90 280 280)"
        />
        {/* Sketch, centred inside the ring (art centre ≈ 288.5, 279 in the 512 box) */}
        <g transform="translate(280 283) scale(0.82) translate(-288.5 -279)">
          {/* 3 — the faint ghost of the full sketch */}
          <g
            className="orato-ghost"
            fill="none"
            stroke={GOLD}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ORATOR_PATHS.map((p, i) => (
              <path key={i} d={p.d} strokeWidth={p.w} />
            ))}
          </g>
          {/* 4 — the strokes drawing themselves in fully */}
          <g
            className="orato-strokes"
            fill="none"
            stroke={GOLD}
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ORATOR_PATHS.map((p, i) => (
              <path
                key={i}
                d={p.d}
                strokeWidth={p.w}
                pathLength="1"
                style={{ animationDelay: `${0.62 + (0.4 * i) / ORATOR_PATHS.length}s` }}
              />
            ))}
          </g>
        </g>
      </svg>
      {/* 6 — the wordmark */}
      <div className="orato-word">orato</div>
    </div>
  );
}

const styles: Record<"wrap" | "svg", React.CSSProperties> = {
  wrap: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(72% 62% at 50% 42%, #4A1420 0%, #350D16 62%, #260810 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  svg: { width: "min(62vw, 280px)", height: "auto", overflow: "visible" },
};

const css = `
/* 1 — dot pops in, then yields to the ring */
.orato-dot {
  transform-origin: 280px 280px;
  transform: scale(0);
  animation:
    oratoDotIn 0.18s cubic-bezier(0.22, 1, 0.36, 1) forwards,
    oratoDotOut 0.25s ease 0.3s forwards;
}
@keyframes oratoDotIn { to { transform: scale(1); } }
@keyframes oratoDotOut { to { transform: scale(0.4); opacity: 0; } }

/* 2 — thin gold outline draws around */
.orato-ring {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: oratoDraw 0.45s cubic-bezier(0.22, 1, 0.36, 1) 0.16s forwards;
}

/* 3 — the sketch surfaces faintly inside the circle */
.orato-ghost {
  opacity: 0;
  animation: oratoGhost 0.35s ease 0.45s forwards;
}
@keyframes oratoGhost { to { opacity: 0.22; } }

/* 4 — details draw themselves in at full strength */
.orato-strokes path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: oratoDraw 0.5s ease forwards; /* per-path delays inline */
}
@keyframes oratoDraw { to { stroke-dashoffset: 0; } }

/* 5 — one soft gold glow pulse over the finished graphic */
.orato-splash-art {
  animation: oratoGlow 0.55s ease-in-out 1.25s;
}
@keyframes oratoGlow {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(201, 168, 118, 0)); }
  50% { filter: drop-shadow(0 0 26px rgba(201, 168, 118, 0.55)); }
}

/* 6 — the serif wordmark, gold, below the circle */
.orato-word {
  margin-top: 26px;
  font-family: "Newsreader Variable", ui-serif, Georgia, serif;
  letter-spacing: 0.4em;
  padding-left: 0.4em;
  font-size: 26px;
  color: ${GOLD};
  opacity: 0;
  transform: translateY(8px);
  animation: oratoWord 0.4s ease 1.4s forwards;
}
@keyframes oratoWord { to { opacity: 1; transform: translateY(0); } }

/* …then the whole overlay hands off to the app */
.orato-splash {
  animation: oratoFade 0.3s ease 1.78s forwards;
}
@keyframes oratoFade { to { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .orato-dot { animation: none; transform: scale(0.4); opacity: 0; }
  .orato-ring { animation: none; stroke-dashoffset: 0; }
  .orato-ghost { animation: none; opacity: 0.22; }
  .orato-strokes path { animation: none; stroke-dashoffset: 0; }
  .orato-splash-art { animation: none; }
  .orato-word { animation: none; opacity: 1; transform: none; }
  .orato-splash { animation: none; }
}
`;
