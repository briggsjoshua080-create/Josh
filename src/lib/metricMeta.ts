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
  clarity: { icon: "eye", nameKey: "metricClarity", expKey: "expClarity", tint: "oklch(0.68 0.07 230)" },
  confidence: { icon: "shield", nameKey: "metricConfidence", expKey: "expConfidence", tint: "oklch(0.62 0.1 20)" },
  structure: { icon: "layers", nameKey: "metricStructure", expKey: "expStructure", tint: "oklch(0.64 0.08 290)" },
  pace: { icon: "gauge", nameKey: "metricPace", expKey: "expPace", tint: "oklch(0.7 0.09 80)" },
  fluency: { icon: "wave", nameKey: "metricFluency", expKey: "expFluency", tint: "oklch(0.68 0.08 200)" },
  wordPower: { icon: "bolt", nameKey: "metricWordPower", expKey: "expWordPower", tint: "oklch(0.68 0.1 55)" },
  conciseness: { icon: "scissors", nameKey: "metricConciseness", expKey: "expConciseness", tint: "oklch(0.66 0.08 340)" },
  engagement: { icon: "sparkle", nameKey: "metricEngagement", expKey: "expEngagement", tint: "oklch(0.66 0.09 155)" },
};

/** Map the AI's confidenceLabel enum to a translatable string key. */
export const CONFIDENCE_LABEL_KEY: Record<string, StringKey> = {
  Tentative: "confLabelTentative",
  Hesitant: "confLabelHesitant",
  Steady: "confLabelSteady",
  Assured: "confLabelAssured",
  Commanding: "confLabelCommanding",
};
