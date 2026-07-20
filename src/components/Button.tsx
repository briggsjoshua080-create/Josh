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

const VARIANTS: Record<string, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-bright active:bg-primary-deep",
  gold: "bg-accent text-accent-ink hover:brightness-105 active:brightness-95",
  ghost:
    "bg-transparent text-ink border border-line hover:bg-surface active:bg-surface-2",
  danger: "bg-bad text-white hover:brightness-110 active:brightness-90",
};

const SIZES: Record<string, string> = {
  md: "h-11 px-5 text-base",
  lg: "h-13 px-7 text-lg",
};

export function Button({ variant = "primary", size = "md", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
