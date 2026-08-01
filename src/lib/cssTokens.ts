import { scoreColorVar } from "./scoreColor";

const tokenCache = new Map<string, string>();

/**
 * Resolve a CSS custom property to its concrete value. Canvas APIs and
 * Motion colour interpolation cannot consume `var()` strings, so chart and
 * count-up colours pass through here once at mount.
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
