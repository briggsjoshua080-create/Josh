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
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active ? "border-cream bg-card text-cream" : "border-cream/25 bg-card/50 text-cream/65 hover:text-cream"
      }`}
    >
      {children}
    </button>
  );
}
