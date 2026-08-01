export type ScoreBand = "excellent" | "good" | "fair" | "weak";

export function scoreBand(score: number): ScoreBand {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "weak";
}

export function scoreColorVar(score: number): string {
  return `var(--score-${scoreBand(score)})`;
}
