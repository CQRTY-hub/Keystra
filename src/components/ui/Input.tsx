import type { InputHTMLAttributes } from "react";

/**
 * DESIGN.md, Inputs > Search Bar: Container Lowest (#0d0e12) background,
 * subtle border, placeholder in Secondary (#45a29e) — that placeholder
 * color comes from the browser's ::placeholder pseudo-element, not a
 * class on the input itself.
 *
 * Always paired with a real, visible <label> at the call site — never
 * a placeholder standing in for one. See PLAN.md: "real labels on every
 * form field".
 */
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
};

export function Input({ label, id, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-title-sm text-on-surface">
        {label}
      </label>
      <input
        id={id}
        className={`rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-body-md text-on-surface placeholder:text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-body-md text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
