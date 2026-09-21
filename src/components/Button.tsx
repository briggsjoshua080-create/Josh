import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "ghost" | "danger";
  size?: "md" | "lg";
  children: ReactNode;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-(--radius-control) font-medium select-none " +
  "transition-[background-color,border-color,color,opacity] duration-150 " +
  "disabled:opacity-40 disabled:pointer-events-none";

// Ink is vellum, not `text-white`: DESIGN.md allows raw colour values only in
// tokens.css (plus the manifest and theme-color meta tag).
const VARIANTS: Record<string, string> = {
  primary:
    "bg-primary text-vellum hover:bg-primary-bright active:bg-primary-deep",
  gold: "bg-accent text-accent-ink hover:brightness-105 active:brightness-95",
  ghost:
    "bg-transparent text-ink border border-line hover:bg-surface active:bg-surface-2",
  danger: "bg-bad text-vellum hover:brightness-110 active:brightness-90",
};

// min-h, not h: DESIGN.md's containment rule, and German labels run 20-35%
// longer than English — a fixed 44px box makes a wrapped label spill instead of
// growing. Padding keeps the single-line height identical to before.
const SIZES: Record<string, string> = {
  md: "min-h-11 py-2.5 px-5 text-base",
  lg: "min-h-13 py-3 px-7 text-lg",
};

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
