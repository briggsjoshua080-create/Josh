import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Launch splash — the logo shatters into the wordmark.
 *
 *   1. shards fly in from off-centre and assemble into the Orato mark
 *   2. the mark holds for a beat
 *   3. it breaks apart, the pieces scattering outward
 *   4. those pieces reassemble into "orato" in gold
 *   5. the overlay fades over the booted app
 *
 * Canvas rather than DOM: this is ~200 independently transformed pieces per
 * frame, which is cheap to draw and ruinous as elements. The reference
 * animation runs 7.6s; a splash the user sees on every launch cannot, so the
 * same five beats are compressed into ~2.6s.
 *
 * Under prefers-reduced-motion nothing animates — the finished wordmark and
 * mark render once and hand off immediately.
 */
const GOLD = "#C9A876";
const DONE_MS = 2650;
const REDUCED_DONE_MS = 700;

/** Timeline in seconds. Each phase staggers its pieces across `stagger`. */
const LOGO_IN = { start: 0.0, dur: 0.85, stagger: 0.28 };
const LOGO_OUT = { start: 1.25, dur: 0.45, stagger: 0.22 };
const TEXT_IN = { start: 1.45, dur: 0.75, stagger: 0.3 };
const FADE = { start: 2.35, dur: 0.3 };

/** Grid resolution of the shatter. Bigger = finer shards, more draw calls. */
const LOGO_COLS = 9;
const TEXT_COLS = 26;
const TEXT_ROWS = 7;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t: number) => t * t * t;

interface Piece {
  /** Source rect inside the offscreen canvas. */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** Destination centre on stage, and drawn size. */
  tx: number;
  ty: number;
  dw: number;
  dh: number;
  /** Where the piece flies in from, and where it flies out to. */
  inDx: number;
  inDy: number;
  inRot: number;
  outDx: number;
  outDy: number;
  outRot: number;
  /** 0–1 position in the stagger. */
  delay: number;
}

/**
 * Cut a canvas into a grid of pieces laid out around (cx, cy), each given a
 * random fly-in origin and fly-out heading. Cells that are fully transparent
 * are dropped, so text costs only as many pieces as it has ink.
 */
function slice(
  src: HTMLCanvasElement,
  cols: number,
  rows: number,
  cx: number,
  cy: number,
  spread: number,
): Piece[] {
  const cw = src.width / cols;
  const ch = src.height / rows;
  const left = cx - src.width / 2;
  const top = cy - src.height / 2;

  const ctx = src.getContext("2d", { willReadFrequently: true })!;
  const { data } = ctx.getImageData(0, 0, src.width, src.height);

  const pieces: Piece[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = Math.floor(c * cw);
      const sy = Math.floor(r * ch);
      const sw = Math.ceil(cw);
      const sh = Math.ceil(ch);

      // Drop empty cells — sample a coarse lattice rather than every pixel.
      let ink = false;
      for (let y = sy; y < Math.min(sy + sh, src.height) && !ink; y += 2) {
        for (let x = sx; x < Math.min(sx + sw, src.width); x += 2) {
          if (data[(y * src.width + x) * 4 + 3] > 12) {
            ink = true;
            break;
          }
        }
      }
      if (!ink) continue;

      const angle = Math.random() * Math.PI * 2;
      const dist = spread * (0.45 + Math.random() * 0.85);
      const outAngle = Math.random() * Math.PI * 2;

      pieces.push({
        sx,
        sy,
        sw,
        sh,
        tx: left + sx + sw / 2,
        ty: top + sy + sh / 2,
        dw: sw,
        dh: sh,
        inDx: Math.cos(angle) * dist,
        inDy: Math.sin(angle) * dist,
        inRot: (Math.random() - 0.5) * 2.6,
        outDx: Math.cos(outAngle) * spread * 0.9,
        outDy: Math.sin(outAngle) * spread * 0.5 + spread * 0.35,
        outRot: (Math.random() - 0.5) * 3.2,
        delay: Math.random(),
      });
    }
  }
  return pieces;
}

/** Draw the mark into an offscreen canvas at the size it will occupy. */
function markCanvas(img: HTMLImageElement, size: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  // Rounded-square tile, matching the header and hero treatment.
  const r = size * 0.23;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.arcTo(size, 0, size, size, r);
  ctx.arcTo(size, size, 0, size, r);
  ctx.arcTo(0, size, 0, 0, r);
  ctx.arcTo(0, 0, size, 0, r);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, 0, 0, size, size);
  return c;
}

/**
 * "orato" set plainly — the reference wordmark is a custom script, but the
 * ask was for basic lettering, so this is the app's own sans, letter-spaced.
 * Characters are placed individually: ctx.letterSpacing is too new to rely on.
 */
function wordCanvas(fontPx: number): HTMLCanvasElement {
  const text = "orato";
  const tracking = fontPx * 0.3;
  const probe = document.createElement("canvas").getContext("2d")!;
  const font = `500 ${fontPx}px "Instrument Sans Variable", system-ui, sans-serif`;
  probe.font = font;

  const widths = [...text].map((ch) => probe.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (text.length - 1);
  const pad = Math.ceil(fontPx * 0.35);

  const c = document.createElement("canvas");
  c.width = Math.ceil(total) + pad * 2;
  c.height = Math.ceil(fontPx * 1.5);
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.font = font;
  ctx.fillStyle = GOLD;
  ctx.textBaseline = "middle";

  let x = pad;
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], x, c.height / 2);
    x += widths[i] + tracking;
  }
  return c;
}

/** Progress of one piece through a phase, including its share of the stagger. */
function phase(t: number, p: { start: number; dur: number; stagger: number }, delay: number) {
  return clamp01((t - p.start - delay * p.stagger) / p.dur);
}

export default function OratoSplash({ onDone }: { onDone?: () => void }) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => onDone?.(), reduced ? REDUCED_DONE_MS : DONE_MS);
    return () => clearTimeout(t);
  }, [onDone, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let cancelled = false;

    const img = new Image();
    img.src = "/icons/icon-512.png";

    function start() {
      if (cancelled || !canvas || !ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = vw / 2;
      const cy = vh * 0.46;
      const spread = Math.min(vw, vh) * 0.42;

      const markSize = Math.round(Math.min(vw * 0.56, 220));
      const mark = markCanvas(img, markSize);
      const markPieces = slice(mark, LOGO_COLS, LOGO_COLS, cx, cy, spread);

      const word = wordCanvas(Math.round(Math.min(vw * 0.1, 40)));
      const wordPieces = slice(word, TEXT_COLS, TEXT_ROWS, cx, cy, spread * 0.8);

      const bg = ctx.createRadialGradient(cx, vh * 0.42, 0, cx, vh * 0.42, Math.max(vw, vh) * 0.8);
      bg.addColorStop(0, "#4A1420");
      bg.addColorStop(0.62, "#350D16");
      bg.addColorStop(1, "#230A0F");

      const t0 = performance.now();

      function frame(now: number) {
        if (cancelled || !canvas || !ctx) return;
        const t = (now - t0) / 1000;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, vw, vh);

        // The mark: flies in, holds, then breaks apart and scatters.
        for (const p of markPieces) {
          const enter = easeOutCubic(phase(t, LOGO_IN, p.delay));
          const exit = easeInCubic(phase(t, LOGO_OUT, p.delay));
          if (enter <= 0 || exit >= 1) continue;

          const x = p.tx + p.inDx * (1 - enter) + p.outDx * exit;
          const y = p.ty + p.inDy * (1 - enter) + p.outDy * exit;
          const rot = p.inRot * (1 - enter) + p.outRot * exit;
          const scale = 1 - 0.35 * (1 - enter) - 0.4 * exit;

          ctx.save();
          ctx.globalAlpha = enter * (1 - exit);
          ctx.translate(x, y);
          ctx.rotate(rot);
          const w = p.dw * scale + 1;
          const h = p.dh * scale + 1;
          ctx.drawImage(mark, p.sx, p.sy, p.sw, p.sh, -w / 2, -h / 2, w, h);
          ctx.restore();
        }

        // The wordmark: the scattered pieces settling into "orato".
        for (const p of wordPieces) {
          const enter = easeOutCubic(phase(t, TEXT_IN, p.delay));
          if (enter <= 0) continue;

          const x = p.tx + p.inDx * (1 - enter);
          const y = p.ty + p.inDy * (1 - enter);
          const rot = p.inRot * (1 - enter);
          const scale = 1 - 0.3 * (1 - enter);

          ctx.save();
          ctx.globalAlpha = enter;
          ctx.translate(x, y);
          ctx.rotate(rot);
          const w = p.dw * scale + 1;
          const h = p.dh * scale + 1;
          ctx.drawImage(word, p.sx, p.sy, p.sw, p.sh, -w / 2, -h / 2, w, h);
          ctx.restore();
        }

        if (wrapRef.current && t >= FADE.start) {
          wrapRef.current.style.opacity = String(1 - clamp01((t - FADE.start) / FADE.dur));
        }

        if (t < DONE_MS / 1000) raf = requestAnimationFrame(frame);
      }

      raf = requestAnimationFrame(frame);
    }

    /** Reduced motion: paint the resting frame once, never animate. */
    function still() {
      if (cancelled || !canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = vw / 2;
      const cy = vh * 0.46;
      const bg = ctx.createRadialGradient(cx, vh * 0.42, 0, cx, vh * 0.42, Math.max(vw, vh) * 0.8);
      bg.addColorStop(0, "#4A1420");
      bg.addColorStop(0.62, "#350D16");
      bg.addColorStop(1, "#230A0F");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, vw, vh);

      const markSize = Math.round(Math.min(vw * 0.56, 220));
      const mark = markCanvas(img, markSize);
      ctx.drawImage(mark, cx - markSize / 2, cy - markSize * 0.9);

      const word = wordCanvas(Math.round(Math.min(vw * 0.1, 40)));
      ctx.drawImage(word, cx - word.width / 2, cy + markSize * 0.22);
    }

    const run = () => (reduced ? still() : start());
    if (img.complete) run();
    else {
      img.onload = run;
      img.onerror = run;
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} style={styles.wrap} role="img" aria-label="Orato">
      <canvas ref={canvasRef} style={styles.canvas} />
    </div>
  );
}

const styles: Record<"wrap" | "canvas", CSSProperties> = {
  wrap: {
    position: "fixed",
    inset: 0,
    background: "#230A0F",
    zIndex: 9999,
  },
  canvas: { display: "block", width: "100%", height: "100%" },
};
