import type { ButtonHTMLAttributes } from "react";

/**
 * DESIGN.md, Component Specifications > Buttons + the primary-cyan usage
 * rule above it. "primary" is the buy action ONLY (add to cart, checkout
 * submit, pay) — don't reach for it for navigation or a search submit.
 * Everything else is "secondary".
 */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-keystra px-4 py-2 text-title-sm " +
    "active:scale-95 transition-[opacity,transform] " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
    "disabled:cursor-not-allowed disabled:opacity-50";
  const variants = {
    primary: "bg-primary text-on-primary hover:opacity-90",
    secondary: "border border-secondary text-secondary hover:bg-container",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props} />
  );
}
