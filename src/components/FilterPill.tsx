import type { ReactNode } from "react";

/** Toggleable filter chip used by the Scenarios and Library filter rows. */
export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`relative after:absolute after:inset-x-0 after:-inset-y-1.5 after:content-[''] flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
        // Full-strength type in both states (the 65% gold measured 3.6:1);
        // the state reads from the border and fill. Champagne on the claret
        // fill clears 4.5:1 where gold (4.3:1) did not.
        active ? "border-gold bg-card text-champagne" : "border-gold/25 bg-card/50 text-gold hover:text-champagne"
      }`}
    >
      {children}
    </button>
  );
}
