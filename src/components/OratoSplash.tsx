import React, { useEffect } from "react";

/**
 * Launch screen: draws the orator on with staggered stroke-dashoffset, fades
 * in the ORATO wordmark, calls onDone after ~2.4s. Honours
 * prefers-reduced-motion (paths render complete, wordmark shows immediately).
 */
export default function OratoSplash({ onDone }: { onDone?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  const stroke = "#E9A45C";
  return (
    <div style={styles.wrap}>
      <style>{css}</style>
      <svg viewBox="0 0 512 512" style={styles.svg} aria-label="Orato">
        <g className="orato-draw" fill="none" stroke={stroke} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
          <path pathLength="1" style={d(0.0)} d="M372 150 V430" />
          <path pathLength="1" style={d(0.05)} d="M418 150 V430" />
          <path pathLength="1" style={d(0.1)} strokeWidth="6" d="M388 162 V420" />
          <path pathLength="1" style={d(0.12)} strokeWidth="6" d="M402 162 V420" />
          <path pathLength="1" style={d(0.15)} d="M360 150 C360 136 366 130 378 130 H412 C424 130 430 136 430 150" />
          <path pathLength="1" style={d(0.18)} d="M360 430 H430" />
          <path pathLength="1" style={d(0.35)} d="M214 214 C200 202 196 170 208 150 C215 135 230 127 244 132 C254 136 258 143 258 151 L272 188 C274 194 271 199 264 199 L257 205 C262 212 263 221 256 231 C249 243 233 245 224 238 C217 233 215 224 215 214 Z" />
          <path pathLength="1" style={d(0.5)} strokeWidth="8" d="M198 150 m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0" />
          <path pathLength="1" style={d(0.55)} strokeWidth="7" d="M212 154 C226 145 246 147 256 156" />
          <path pathLength="1" style={d(0.6)} d="M222 240 L216 266" />
          <path pathLength="1" style={d(0.62)} d="M256 232 C258 248 254 258 262 270" />
          <path pathLength="1" style={d(0.7)} d="M262 272 C300 264 324 240 332 210 C338 188 346 172 356 162" />
          <path pathLength="1" style={d(0.85)} strokeWidth="8" d="M356 162 C363 155 370 154 375 160" />
          <path pathLength="1" style={d(0.75)} d="M216 266 C188 274 168 292 160 322" />
          <path pathLength="1" style={d(0.78)} d="M262 270 C282 300 292 336 288 372" />
          <path pathLength="1" style={d(0.9)} strokeWidth="6" d="M206 288 C220 320 244 342 258 372" />
          <path pathLength="1" style={d(0.95)} strokeWidth="6" d="M182 306 C214 326 246 336 276 332" />
          <path pathLength="1" style={d(0.85)} d="M164 322 C176 348 202 360 232 352" />
          <path pathLength="1" style={d(1.0)} strokeWidth="8" d="M232 344 L232 362" />
          <path pathLength="1" style={d(1.0)} strokeWidth="9" d="M160 372 C200 392 250 390 288 372" />
        </g>
      </svg>
      <div className="orato-word">ORATO</div>
    </div>
  );
}

const d = (delay: number): React.CSSProperties => ({ animationDelay: `${delay}s` });

const styles: Record<"wrap" | "svg", React.CSSProperties> = {
  wrap: { position: "fixed", inset: 0, background: "radial-gradient(70% 60% at 50% 42%, #211712 0%, #130E0C 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 9999 },
  svg: { width: "min(58vw, 260px)", height: "auto", overflow: "visible" },
};

const css = `
.orato-draw path { stroke-dasharray: 1; stroke-dashoffset: 1; animation: oratoDraw 1s ease forwards; }
@keyframes oratoDraw { to { stroke-dashoffset: 0; } }
.orato-word { margin-top: 22px; font-family: ui-serif, Georgia, serif; letter-spacing: 0.42em; padding-left: 0.42em; font-size: 22px; color: #F0E7DD; opacity: 0; transform: translateY(8px); animation: oratoWord 0.8s ease forwards; animation-delay: 1.35s; }
@keyframes oratoWord { to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .orato-draw path { animation: none; stroke-dashoffset: 0; } .orato-word { animation: none; opacity: 1; transform: none; } }
`;
