import React, { useEffect } from "react";

/**
 * Launch splash — a six-beat sequence on a deep wine ground, built around the
 * real orator emblem (public/orato-logo.png, the same artwork as the app icon
 * and header logo):
 *   1. a small Dutch-White dot appears at centre
 *   2. the dot hands off to a thin gold circle outline drawing itself
 *   3. the orator emblem fades in faintly inside the circle
 *   4. the emblem resolves to full strength (opacity + settle)
 *   5. the whole graphic gets a soft glow pulse
 *   6. "orato" fades in below in serif Dutch White
 * Total ≈1.8s, then the overlay fades out over the booted app; onDone at ~2s.
 * Honours prefers-reduced-motion (everything renders complete immediately).
 */
const CREAM = "#EFDFBB";
const RING = "#C9A876";
const DONE_MS = 2050;

export default function OratoSplash({ onDone }: { onDone?: () => void }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => onDone && onDone(), reduced ? 600 : DONE_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="orato-splash" style={styles.wrap}>
      <style>{css}</style>
      <div className="orato-splash-art" style={styles.stage}>
        {/* 3–4 — the orator emblem, cropped to a disc, revealed inside the ring */}
        <img
          src="/orato-logo.png"
          alt="Orato"
          className="orato-emblem"
          draggable={false}
          style={styles.emblem}
        />
        {/* 1–2 — the dot and the drawn gold circle */}
        <svg viewBox="0 0 300 300" style={styles.ringSvg} aria-hidden="true">
          <circle className="orato-dot" cx="150" cy="150" r="9" fill={CREAM} />
          <circle
            className="orato-ring"
            cx="150"
            cy="150"
            r="140"
            pathLength="1"
            fill="none"
            stroke={RING}
            strokeWidth="3"
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
          />
        </svg>
      </div>
      {/* 6 — the wordmark */}
      <div className="orato-word">orato</div>
    </div>
  );
}

const styles: Record<"wrap" | "stage" | "emblem" | "ringSvg", React.CSSProperties> = {
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
  stage: { position: "relative", width: "min(62vw, 280px)", aspectRatio: "1 / 1" },
  emblem: {
    position: "absolute",
    inset: "9%",
    width: "82%",
    height: "82%",
    borderRadius: "50%",
    objectFit: "cover",
    userSelect: "none",
  },
  ringSvg: { position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" },
};

const css = `
/* 1 — dot pops in, then yields to the ring */
.orato-dot {
  transform-origin: 150px 150px;
  transform: scale(0);
  animation:
    oratoDotIn 0.18s cubic-bezier(0.22, 1, 0.36, 1) forwards,
    oratoDotOut 0.25s ease 0.3s forwards;
}
@keyframes oratoDotIn { to { transform: scale(1); } }
@keyframes oratoDotOut { to { transform: scale(0.4); opacity: 0; } }

/* 2 — thin gold circle draws around */
.orato-ring {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: oratoDraw 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.18s forwards;
}
@keyframes oratoDraw { to { stroke-dashoffset: 0; } }

/* 3–4 — the emblem surfaces faintly, then resolves to full */
.orato-emblem {
  opacity: 0;
  transform: scale(0.9);
  animation:
    oratoEmblemGhost 0.3s ease 0.5s forwards,
    oratoEmblemFull 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.82s forwards;
}
@keyframes oratoEmblemGhost { to { opacity: 0.28; transform: scale(0.94); } }
@keyframes oratoEmblemFull { to { opacity: 1; transform: scale(1); } }

/* 5 — one soft glow pulse over the finished graphic */
.orato-splash-art {
  animation: oratoGlow 0.6s ease-in-out 1.3s;
}
@keyframes oratoGlow {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(201, 168, 118, 0)); }
  50% { filter: drop-shadow(0 0 30px rgba(201, 168, 118, 0.5)); }
}

/* 6 — the serif wordmark, Dutch White, below the circle */
.orato-word {
  margin-top: 26px;
  font-family: "Newsreader Variable", ui-serif, Georgia, serif;
  letter-spacing: 0.4em;
  padding-left: 0.4em;
  font-size: 26px;
  color: ${CREAM};
  opacity: 0;
  transform: translateY(8px);
  animation: oratoWord 0.42s ease 1.42s forwards;
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
  .orato-emblem { animation: none; opacity: 1; transform: none; }
  .orato-splash-art { animation: none; }
  .orato-word { animation: none; opacity: 1; transform: none; }
  .orato-splash { animation: none; }
}
`;
