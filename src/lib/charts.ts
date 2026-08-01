import {
  Chart,
  CategoryScale,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
} from "chart.js";
import { scoreColorVar } from "./scoreColor";

// One-time registration of the only Chart.js pieces the app uses (radar +
// area line). Tooltips are custom/disabled, legends are custom HTML.
Chart.register(RadialLinearScale, LinearScale, CategoryScale, PointElement, LineElement, Filler);

Chart.defaults.font.family = getComputedStyle(document.documentElement)
  .getPropertyValue("--font-sans")
  .trim() || "system-ui, sans-serif";

const tokenCache = new Map<string, string>();

/**
 * Resolve a CSS custom property to its concrete value. Canvas APIs cannot
 * consume `var()` strings, so chart colours pass through here once at mount.
 */
export function resolveToken(name: string): string {
  const cached = tokenCache.get(name);
  if (cached) return cached;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (value) tokenCache.set(name, value);
  return value;
}

/** scoreColorVar for canvas: same band system, resolved to a concrete colour. */
export function resolveScoreColor(score: number): string {
  const varRef = scoreColorVar(score); // "var(--score-…)"
  return resolveToken(varRef.slice(4, -1));
}
