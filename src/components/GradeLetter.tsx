/**
 * Renders a letter grade with its +/- suffix at ~65% of the base size,
 * aligned to the top of the letter, so "B+" never reads as "B" at a glance.
 * Colour comes from scoreColorVar(score) at the call site — grade bands and
 * colour bands are separate systems reading the same score.
 */
export function GradeLetter({ grade, className, color }: { grade: string; className?: string; color?: string }) {
  const base = grade.charAt(0);
  const suffix = grade.length > 1 ? grade.slice(1) : null;
  return (
    <span className={`inline-flex items-start whitespace-nowrap ${className ?? ""}`} style={color ? { color } : undefined}>
      <span>{base}</span>
      {suffix && (
        <span aria-hidden="false" className="leading-none" style={{ fontSize: "0.65em", marginTop: "0.08em" }}>
          {suffix}
        </span>
      )}
    </span>
  );
}
