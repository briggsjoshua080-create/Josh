export interface GradeBand {
  letter: string;
  min: number;
  max: number;
}

// Deliberately front-loaded: F only for a genuinely poor session (<30),
// D- is the widest band (an off session, not a disaster), and bands
// narrow steadily toward the top so a high A takes real consistency.
export const GRADE_BANDS: GradeBand[] = [
  { letter: "F", min: 0, max: 29 },
  { letter: "D-", min: 30, max: 49 },
  { letter: "D", min: 50, max: 61 },
  { letter: "D+", min: 62, max: 68 },
  { letter: "C-", min: 69, max: 74 },
  { letter: "C", min: 75, max: 79 },
  { letter: "C+", min: 80, max: 83 },
  { letter: "B-", min: 84, max: 87 },
  { letter: "B", min: 88, max: 90 },
  { letter: "B+", min: 91, max: 93 },
  { letter: "A-", min: 94, max: 96 },
  { letter: "A", min: 97, max: 99 },
  { letter: "A+", min: 100, max: 100 },
];

export function letterGrade(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const band = GRADE_BANDS.find((b) => clamped >= b.min && clamped <= b.max);
  return band ? band.letter : "F";
}
