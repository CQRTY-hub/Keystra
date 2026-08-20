import type { ButtonHTMLAttributes } from "react";

/**
 * Deliberately plain (PLAN.md, "Visual design in this phase: deliberately
 * none"). Default Tailwind utilities only, no hex values, no theme —
 * Phase 1.5 restyles this component, not the pages that use it.
 */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded px-4 py-2 font-medium " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    secondary: "border border-slate-300 text-slate-900 hover:bg-slate-100",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
