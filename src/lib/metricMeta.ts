import type { MetricKey } from "./types";
import type { StringKey } from "./strings";

/**
 * Shared presentation metadata for the eight metrics: icon plus i18n keys
 * for the full name, the short radar-axis name, and the explanation.
 * Score-driven colour comes from lib/scoreColor — never per-metric tints.
 */
export const METRIC_META: Record<
  MetricKey,
  { icon: string; nameKey: StringKey; shortKey: StringKey; expKey: StringKey }
> = {
  clarity: { icon: "eye", nameKey: "metricClarity", shortKey: "metricShortClarity", expKey: "expClarity" },
  confidence: { icon: "shield", nameKey: "metricConfidence", shortKey: "metricShortConfidence", expKey: "expConfidence" },
  structure: { icon: "layers", nameKey: "metricStructure", shortKey: "metricShortStructure", expKey: "expStructure" },
  pace: { icon: "gauge", nameKey: "metricPace", shortKey: "metricShortPace", expKey: "expPace" },
  fluency: { icon: "wave", nameKey: "metricFluency", shortKey: "metricShortFluency", expKey: "expFluency" },
  wordPower: { icon: "bolt", nameKey: "metricWordPower", shortKey: "metricShortWordPower", expKey: "expWordPower" },
  conciseness: { icon: "scissors", nameKey: "metricConciseness", shortKey: "metricShortConciseness", expKey: "expConciseness" },
  engagement: { icon: "sparkle", nameKey: "metricEngagement", shortKey: "metricShortEngagement", expKey: "expEngagement" },
};

/** Map the AI's confidenceLabel enum to a translatable string key. */
export const CONFIDENCE_LABEL_KEY: Record<string, StringKey> = {
  Tentative: "confLabelTentative",
  Hesitant: "confLabelHesitant",
  Steady: "confLabelSteady",
  Assured: "confLabelAssured",
  Commanding: "confLabelCommanding",
};
