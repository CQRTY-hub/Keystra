/**
 * Small hand-rolled inline icons — no icon library in this project yet,
 * and these six don't justify adding one. All stroke-based, 1.5px,
 * currentColor, so they inherit whatever text color the call site sets
 * (never a hardcoded fill — DESIGN.md's cyan usage rule still applies to
 * these the same as any other element).
 */
import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="8.5" cy="8.5" r="5.5" />
      <path d="M16.5 16.5 13 13" />
    </Icon>
  );
}

export function CartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 3h1.6l1.2 10.2A2 2 0 0 0 7.8 15h6.9a2 2 0 0 0 2-1.7L18 6H5.4" />
      <circle cx="8.5" cy="18" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function TrackOrderIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M10 2.5 17 6v8l-7 3.5L3 14V6z" />
      <path d="M3 6l7 3.5L17 6M10 9.5V17.5" />
    </Icon>
  );
}

export function TrendingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 14.5 8 9l3.5 3.5L17 6" />
      <path d="M12.5 6H17v4.5" />
    </Icon>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 10h12M11 5l5 5-5 5" />
    </Icon>
  );
}
