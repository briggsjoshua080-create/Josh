import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { AiTextLoading } from "@/components/kokonut/AiTextLoading";

const BAR_COUNT = 38;
/** One full sweep is 2.4s (see .coach-scanline); the wave crosses in 70% of it. */
const BAR_STAGGER = (2.4 * 0.7) / BAR_COUNT;

/**
 * Deterministic bar heights — a fixed sine blend rather than Math.random, so
 * the waveform is identical across re-renders and never reshuffles mid-analysis.
 * Three incommensurate frequencies give the jitter of speech; the envelope
 * tapers both ends so it reads as a clip rather than a bar chart.
 */
function barHeight(i: number): number {
  const p = i / (BAR_COUNT - 1);
  const detail = Math.abs(Math.sin(i * 1.7) * 0.5 + Math.sin(i * 0.53 + 1.1) * 0.32 + Math.sin(i * 3.1) * 0.18);
  const envelope = 0.45 + 0.55 * Math.sin(Math.PI * p); // 0.45 at the ends, 1 mid-clip
  // Ceiling is BOX_H minus the 24px vertical padding, so no bar is clipped
  // flat by the box (which would flatten the waveform into a band).
  return 10 + detail * envelope * 56;
}

/** Fixed so the box reserves its space before the bars render (no layout shift). */
const BOX_H = 114;

/**
 * The "your coach is going through the recording" state: a still waveform with
 * a gold read-head crossing it, over the rotating coach phrases. Replaces the
 * generic spinner on both the recording screen (analysing) and the feedback
 * screen (waiting on the report).
 */
export function CoachListening() {
  const { t } = useI18n();
  const bars = useMemo(() => Array.from({ length: BAR_COUNT }, (_, i) => barHeight(i)), []);

  return (
    <div className="box-border flex w-full flex-col items-center gap-5" role="status" aria-live="polite">
      {/* justify-between spreads the bars edge to edge whatever the count is,
          so the read-head never crosses empty space. */}
      <div
        className="relative box-border flex w-full max-w-sm items-center justify-between overflow-hidden rounded-(--radius-card) bg-obsidian px-5 py-6"
        style={{ height: BOX_H }}
        aria-label={t("coachReviewing")}
      >
        {bars.map((h, i) => (
          <span
            key={i}
            className="coach-bar w-[3px] shrink-0 rounded-full bg-bronze"
            style={{ height: h, animationDelay: `${(i * BAR_STAGGER).toFixed(3)}s` }}
          />
        ))}

        {/* Read-head: a full-width rail carrying a 2px line at its left edge. */}
        <span aria-hidden="true" className="coach-scanline pointer-events-none absolute inset-y-3 left-0 w-full">
          <span
            className="absolute inset-y-0 left-0 w-[2px] rounded-full bg-gold"
            style={{ boxShadow: "0 0 10px color-mix(in srgb, var(--orato-gold) 55%, transparent)" }}
          />
        </span>
      </div>

      <div className="w-full max-w-sm">
        <AiTextLoading phrases={[t("aiLoading1"), t("aiLoading2"), t("aiLoading3"), t("aiLoading4")]} />
      </div>
    </div>
  );
}
