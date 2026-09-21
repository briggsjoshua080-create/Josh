import type { PauseEvent, SpeechSegment } from "./types";
import { PAUSE_THRESHOLD_MS, type RecorderResult } from "./speech";

/**
 * A recording runs across one or more legs. A leg ends when the user pauses
 * or when a too-short take picks the mic back up; the next leg starts when
 * they resume. Merging them back into one recording is the only place the
 * app does timestamp arithmetic, so it lives here rather than in the screen.
 */
export interface Leg {
  segments: SpeechSegment[];
  pauses: PauseEvent[];
  durationSec: number;
  volume: RecorderResult["volume"];
  /** Wall-clock time the user spent paused after this leg (0 on the last one). */
  pausedAfterMs: number;
}

export interface MergedRecording {
  segments: SpeechSegment[];
  pauses: PauseEvent[];
  durationSec: number;
  volume: { mean: number; std: number } | null;
}

/**
 * Time spent paused counts exactly as silence on-mic does: it advances the
 * clock and, past the same threshold, registers as a pause. Otherwise tapping
 * Pause to think would buy a better pace and a longer clean-speech stretch
 * than thinking out loud does, and the scores would stop meaning anything.
 */
export function mergeLegs(legs: Leg[]): MergedRecording {
  const segments: SpeechSegment[] = [];
  const pauses: PauseEvent[] = [];
  let offsetMs = 0;
  let durationSec = 0;
  let weightedMean = 0;
  let weightedSq = 0;
  let count = 0;

  for (const leg of legs) {
    for (const s of leg.segments) segments.push({ ...s, t: s.t + offsetMs });
    for (const p of leg.pauses) pauses.push({ ...p, atMs: p.atMs + offsetMs });

    const legMs = leg.durationSec * 1000;
    if (leg.pausedAfterMs >= PAUSE_THRESHOLD_MS) {
      pauses.push({ atMs: Math.round(offsetMs + legMs), durationMs: Math.round(leg.pausedAfterMs) });
    }

    offsetMs += legMs + leg.pausedAfterMs;
    durationSec += leg.durationSec + leg.pausedAfterMs / 1000;

    if (leg.volume) {
      // Pooled across legs: E[X²] per leg recovered from std² + mean², so the
      // spread between leg means survives into the combined standard deviation.
      weightedMean += leg.volume.mean * leg.volume.count;
      weightedSq += (leg.volume.std ** 2 + leg.volume.mean ** 2) * leg.volume.count;
      count += leg.volume.count;
    }
  }

  let volume: MergedRecording["volume"] = null;
  if (count > 0) {
    const mean = weightedMean / count;
    const variance = Math.max(0, weightedSq / count - mean * mean);
    volume = { mean: +mean.toFixed(3), std: +Math.sqrt(variance).toFixed(3) };
  }

  return { segments, pauses, durationSec, volume };
}
