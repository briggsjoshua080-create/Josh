import type { MetricKey } from "./types";
import type { StringKey } from "./strings";

/**
 * Shared presentation metadata for the eight metrics: icon, i18n keys, and
 * the muted per-metric tint used only on the stat/score bars (the single
 * amber accent stays reserved for active/primary/earned things).
 */
export const METRIC_META: Record<
  MetricKey,
  { icon: string; nameKey: StringKey; expKey: StringKey; tint: string }
> = {
  // Tints walk the wine→cream ramp so the bars stay inside the label palette.
  clarity: { icon: "eye", nameKey: "metricClarity", expKey: "expClarity", tint: "oklch(0.85 0.055 90)" },
  confidence: { icon: "shield", nameKey: "metricConfidence", expKey: "expConfidence", tint: "oklch(0.62 0.13 17)" },
  structure: { icon: "layers", nameKey: "metricStructure", expKey: "expStructure", tint: "oklch(0.72 0.075 55)" },
  pace: { icon: "gauge", nameKey: "metricPace", expKey: "expPace", tint: "oklch(0.78 0.065 75)" },
  fluency: { icon: "wave", nameKey: "metricFluency", expKey: "expFluency", tint: "oklch(0.67 0.1 35)" },
  wordPower: { icon: "bolt", nameKey: "metricWordPower", expKey: "expWordPower", tint: "oklch(0.88 0.045 95)" },
  conciseness: { icon: "scissors", nameKey: "metricConciseness", expKey: "expConciseness", tint: "oklch(0.56 0.115 17)" },
  engagement: { icon: "sparkle", nameKey: "metricEngagement", expKey: "expEngagement", tint: "oklch(0.75 0.085 65)" },
};

/** Map the AI's confidenceLabel enum to a translatable string key. */
export const CONFIDENCE_LABEL_KEY: Record<string, StringKey> = {
  Tentative: "confLabelTentative",
  Hesitant: "confLabelHesitant",
  Steady: "confLabelSteady",
  Assured: "confLabelAssured",
  Commanding: "confLabelCommanding",
};
