import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "motion/react";
import type { CategoryFeedback, CategoryId7 } from "@/lib/types";
import { gradeLetter } from "@/lib/analysis";
import { Icon } from "@/components/Icon";

/**
 * The feedback results screen: an animated overall score ring with a letter
 * grade, a staggered list of category cards (progress bar + score/grade + note
 * + improvement tip), and a summary card that fades in last.
 *
 * Dark charcoal surfaces with an amber→orange gradient accent, wired to the
 * real seven-category report. Offline pace/volume rows render immediately;
 * API-based rows can be in a "pending" or "error" state independently.
 */

export interface ReportRow {
  id: CategoryId7;
  label: string;
  data: CategoryFeedback;
  /** ok = scored; pending = API in flight; error = API failed/unavailable. */
  state: "ok" | "pending" | "error";
}

export interface FeedbackReportProps {
  rows: ReportRow[];
  summary: string;
  /** Animate the count-up ring, staggered bars, and summary fade on first view. */
  reveal?: boolean;
  labels: { improve: string; overall: string; summary: string };
  contentError?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  errorNote?: string;
}

const ACCENT_GRADIENT = "linear-gradient(90deg, var(--color-primary-bright), var(--color-accent))";

function gradeColor(score: number): string {
  if (score >= 80) return "var(--color-accent)";
  if (score >= 60) return "var(--color-accent-dim)";
  return "var(--color-bad)";
}

export function FeedbackReport({
  rows,
  summary,
  reveal = false,
  labels,
  contentError = false,
  onRetry,
  retryLabel,
  errorNote,
}: FeedbackReportProps) {
  const scored = rows.filter((r) => r.state === "ok").map((r) => r.data.score);
  const overall = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : 0;

  // Summary fades in after the last category card's stagger step.
  const summaryDelay = 0.25 + rows.length * 0.08 + 0.15;

  return (
    <div className="flex flex-col items-center">
      <OverallRing value={overall} label={labels.overall} reveal={reveal} />

      <div className="mt-10 flex w-full flex-col gap-3">
        {rows.map((row, i) => (
          <CategoryCard
            key={row.id}
            row={row}
            improveLabel={labels.improve}
            reveal={reveal}
            delay={0.25 + i * 0.08}
          />
        ))}
      </div>

      {contentError && (
        <div className="mt-4 flex w-full flex-col gap-3 rounded-(--radius-card) border border-line bg-surface p-5">
          {errorNote && <p className="text-sm text-warn">{errorNote}</p>}
          {onRetry && retryLabel && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 rounded-(--radius-control) bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-bright"
            >
              <Icon name="refresh" size={16} />
              {retryLabel}
            </button>
          )}
        </div>
      )}

      {summary && (
        <motion.div
          className="mt-8 w-full rounded-(--radius-card) border border-line bg-surface p-6"
          initial={reveal ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reveal ? summaryDelay : 0, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-sm font-medium text-accent">{labels.summary}</h2>
          <p className="lectern mt-3 text-lg leading-relaxed text-ink">{summary}</p>
        </motion.div>
      )}
    </div>
  );
}

// ——— Overall ring ————————————————————————————————————————————————————————

function OverallRing({ value, label, reveal }: { value: number; label: string; reveal: boolean }) {
  const reduced = useReducedMotion();
  const size = 176;
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const animateIt = reveal && !reduced;

  const [shown, setShown] = useState(animateIt ? 0 : value);
  const circleRef = useRef<SVGCircleElement>(null);
  // Track the last rendered value so a later overall change (the API resolving)
  // animates smoothly from where the ring is, rather than snapping back to 0.
  const shownRef = useRef(animateIt ? 0 : value);

  useEffect(() => {
    const paint = (v: number) => {
      shownRef.current = v;
      setShown(Math.round(v));
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(circumference * (1 - v / 100));
      }
    };
    if (!animateIt) {
      paint(value);
      return;
    }
    const controls = animate(shownRef.current, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: paint,
    });
    return () => controls.stop();
  }, [value, animateIt, circumference]);

  const grade = gradeLetter(value);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={`${label}: ${value}, grade ${grade}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-bright)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={strokeWidth} />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (animateIt ? 0 : value) / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-5xl font-bold leading-none"
          style={{ background: ACCENT_GRADIENT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        >
          {grade}
        </span>
        <span className="tnum mt-1.5 text-2xl font-semibold text-ink leading-none">{shown}</span>
        <span className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</span>
      </div>
    </div>
  );
}

// ——— Category card ———————————————————————————————————————————————————————

function CategoryCard({
  row,
  improveLabel,
  reveal,
  delay,
}: {
  row: ReportRow;
  improveLabel: string;
  reveal: boolean;
  delay: number;
}) {
  const reduced = useReducedMotion();
  const { label, data, state } = row;
  const grade = gradeLetter(data.score);

  return (
    <motion.div
      className="rounded-(--radius-card) border border-line bg-surface p-5"
      initial={reveal && !reduced ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: reveal && !reduced ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-ink">{label}</span>
        {state === "ok" ? (
          <span className="flex items-baseline gap-2">
            <span
              className="text-sm font-bold"
              style={{ color: gradeColor(data.score) }}
            >
              {grade}
            </span>
            <span className="tnum text-sm font-semibold text-ink">{data.score}</span>
          </span>
        ) : (
          <span className="text-sm text-muted">{state === "pending" ? "…" : "—"}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-2">
        {state === "ok" ? (
          <motion.div
            className="h-full rounded-full"
            style={{ background: ACCENT_GRADIENT }}
            initial={reveal && !reduced ? { width: 0 } : { width: `${data.score}%` }}
            animate={{ width: `${data.score}%` }}
            transition={{ duration: 0.6, delay: reveal && !reduced ? delay + 0.1 : 0, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : state === "pending" ? (
          <div className="h-full w-1/3 animate-pulse rounded-full bg-surface-2" />
        ) : null}
      </div>

      {/* Note + improvement */}
      {state === "ok" ? (
        <>
          {data.note && <p className="mt-3 text-sm leading-relaxed text-ink/85">{data.note}</p>}
          {data.improve && (
            <p className="mt-2 flex gap-2 text-sm leading-relaxed text-muted">
              <Icon name="sparkle" size={15} className="mt-0.5 shrink-0 text-accent-dim" />
              <span>
                <span className="font-medium text-accent-dim">{improveLabel}: </span>
                {data.improve}
              </span>
            </p>
          )}
        </>
      ) : (
        <p className="mt-3 text-sm text-muted">{data.note}</p>
      )}
    </motion.div>
  );
}
