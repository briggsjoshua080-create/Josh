import type { CategoryFeedback, Lang, VolumeStats } from "./types";

/**
 * Fully-offline pace & volume analysis. Nothing here touches the network — it
 * runs on the Web Speech timings (words per minute) and the Web Audio
 * AnalyserNode samples collected during recording, so the results are ready
 * the instant recording ends, independent of the API call.
 *
 * Both produce the same { score, note, improve } shape as the API categories
 * so the results screen can render all seven uniformly.
 */

// ——— Pace ———————————————————————————————————————————————————————————————

/** The comfortable band; outside it the score falls off linearly. */
const PACE_SLOW = 110;
const PACE_FAST = 160;

/** 0–100 pace score from words-per-minute. Language-independent by design. */
export function paceScore(wpm: number): number {
  if (wpm <= 0) return 0;
  if (wpm >= PACE_SLOW && wpm <= PACE_FAST) return 100;
  const dist = wpm < PACE_SLOW ? PACE_SLOW - wpm : wpm - PACE_FAST;
  return Math.max(25, Math.round(100 - dist * 1.2));
}

export function paceCategory(wpm: number, lang: Lang): CategoryFeedback {
  const de = lang === "de";
  const score = paceScore(wpm);

  let note: string;
  let improve: string;
  if (wpm > PACE_FAST) {
    note = de
      ? `${wpm} Wörter pro Minute — flott. Schnelles Sprechen wirkt schnell nervös und lässt Pointen untergehen.`
      : `${wpm} words per minute — fast. A rushed pace reads as nervous and buries your best lines.`;
    improve = de
      ? "Setze bewusste Pausen nach jedem Kerngedanken. Stille gibt dem Publikum Zeit, dir zu folgen."
      : "Plant a deliberate pause after each key point. Silence gives the audience time to catch up.";
  } else if (wpm < PACE_SLOW) {
    note = de
      ? `${wpm} WpM — gemächlich. Zu langsames Tempo verliert die Aufmerksamkeit, bevor der Punkt kommt.`
      : `${wpm} wpm — slow. Too measured a pace loses attention before the point lands.`;
    improve = de
      ? "Nimm etwas mehr Zug nach vorn: Sätze verbinden statt zwischen jedem Wort zu zögern."
      : "Add a touch more forward drive — connect your sentences instead of hesitating between words.";
  } else {
    note = de
      ? `${wpm} WpM — ein Tempo, dem man mühelos folgt.`
      : `${wpm} words per minute — a pace an audience follows without effort.`;
    improve = de
      ? "Halte dieses Tempo und variiere es bewusst: langsamer bei wichtigen Punkten, schneller bei Aufzählungen."
      : "Hold this pace and vary it on purpose: slower on the important points, quicker through lists.";
  }
  return { score, note, improve };
}

// ——— Volume ——————————————————————————————————————————————————————————————
//
// avg / dynamicRange are 0–1 fractions of the level meter's full scale.
// Thresholds are heuristic and tuned for the meter in speech.ts (rms * 4,
// clamped to 1); adjust here if the meter's scaling changes.

const VOL_QUIET = 0.1;
const VOL_LOUD = 0.72;
const VOL_MONOTONE = 0.045;

/** 0–100 volume score, or null when no voiced audio was ever measured. */
export function volumeScore(v: VolumeStats | undefined): number | null {
  if (!v || v.samples === 0) return null;
  if (v.avg < VOL_QUIET) {
    // Too quiet — scale up toward 70 as it approaches the healthy band.
    return Math.round(45 + (v.avg / VOL_QUIET) * 25);
  }
  if (v.avg > VOL_LOUD) {
    // Too loud — scale down from 70 toward 45 at full scale.
    return Math.round(70 - ((v.avg - VOL_LOUD) / (1 - VOL_LOUD)) * 25);
  }
  if (v.dynamicRange < VOL_MONOTONE) {
    // Good level but flat/monotone.
    return 66;
  }
  // Healthy level and dynamic — reward range up to a ceiling.
  return Math.min(96, Math.round(84 + v.dynamicRange * 60));
}

export function volumeCategory(v: VolumeStats | undefined, lang: Lang): CategoryFeedback {
  const de = lang === "de";
  const score = volumeScore(v);

  if (score === null) {
    return {
      score: 0,
      note: de
        ? "Keine Lautstärke gemessen — das Mikrofon war stumm oder nicht verfügbar."
        : "No volume captured — the microphone was silent or unavailable.",
      improve: de
        ? "Prüfe die Mikrofon-Freigabe und sprich hörbar in Richtung des Mikrofons."
        : "Check the microphone permission and speak audibly toward the mic.",
    };
  }

  let note: string;
  let improve: string;
  if (v!.avg < VOL_QUIET) {
    note = de
      ? "Durchgehend leise. Ein zu leiser Vortrag klingt zögerlich und ist schwer zu verstehen."
      : "Consistently quiet. Too soft a delivery reads as tentative and is hard to follow.";
    improve = de
      ? "Sprich aus dem Zwerchfell und stell dir zu, dass die hinterste Reihe dich mühelos hört."
      : "Project from your diaphragm — aim to reach the back row without straining.";
  } else if (v!.avg > VOL_LOUD) {
    note = de
      ? "Durchgehend sehr laut. Konstante Lautstärke ermüdet und nimmt Betonungen die Wirkung."
      : "Consistently loud. A constant high volume tires the ear and flattens your emphasis.";
    improve = de
      ? "Nimm die Grundlautstärke zurück, damit lautere Momente wieder etwas hervorheben können."
      : "Bring the baseline down so the louder moments can actually stand out again.";
  } else if (v!.dynamicRange < VOL_MONOTONE) {
    note = de
      ? "Gute Lautstärke, aber flach. Wenig Dynamik lässt selbst starke Inhalte monoton wirken."
      : "Good level, but flat. Little variation makes even strong material sound monotone.";
    improve = de
      ? "Spiel bewusst mit Lautstärke: hebe Schlüsselwörter an, nimm dich bei Nebensätzen zurück."
      : "Play with volume on purpose: lift key words, pull back on the asides.";
  } else {
    note = de
      ? "Klare Lautstärke mit gesunder Dynamik — angenehm zu hören."
      : "Clear level with healthy dynamics — easy and engaging to listen to.";
    improve = de
      ? "Halte diese Bandbreite und nutze sie gezielt, um Struktur hörbar zu machen."
      : "Keep this range and use it deliberately to make your structure audible.";
  }
  return { score, note, improve };
}

// ——— Grades ——————————————————————————————————————————————————————————————

export type Grade = "A" | "B" | "C" | "D" | "F";

/** A ≥90, B ≥80, C ≥70, D ≥60, F <60. */
export function gradeLetter(score: number): Grade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
