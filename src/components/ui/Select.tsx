import type { SelectHTMLAttributes } from "react";

/**
 * Same visual language as Input.tsx (border/background/focus ring) — no
 * dedicated design-system spec for a select existed yet, so this mirrors
 * Input's classes rather than inventing a new look. First real use:
 * CheckoutForm's country field (src/lib/countries.ts).
 */
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  id: string;
  error?: string;
};

export function Select({ label, id, error, className = "", children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-title-sm text-on-surface">
        {label}
      </label>
      <select
        id={id}
        className={`rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-body-md text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} className="text-body-md text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
