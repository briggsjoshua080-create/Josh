import { SCENARIOS_1 } from "./scenarios-1";
import { SCENARIOS_2 } from "./scenarios-2";
import { SCENARIOS_3 } from "./scenarios-3";
import { SCENARIOS_4 } from "./scenarios-4";
import { SCENARIOS_5 } from "./scenarios-5";
import { SCENARIOS_6 } from "./scenarios-6";

/**
 * The standalone practice library: 248 scenarios across 10 categories.
 * Files 3 and 4 are the impromptu set — every one of those titles carries
 * "Impromptu" / "Stegreif", so a single search pulls all 100 out of the deck.
 * Files 5 and 6 are the former fixed 66-day daily-challenge path, converted
 * into ordinary scenarios once the daily challenge became a random pick
 * (see src/lib/daily.ts) instead of a fixed day-by-day sequence.
 */
export const SCENARIOS = [
  ...SCENARIOS_1,
  ...SCENARIOS_2,
  ...SCENARIOS_3,
  ...SCENARIOS_4,
  ...SCENARIOS_5,
  ...SCENARIOS_6,
];
