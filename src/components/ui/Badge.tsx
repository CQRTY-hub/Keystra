import type { ReactNode } from "react";

/**
 * Plain by design. No colour-coded urgency, no "🔥 HOT DEAL" styling —
 * that's exactly the kind of thing PRODUCT.md's anti-references list
 * (Phase 1.5) rules out. This just labels a fact: platform, region, status.
 */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded border border-slate-300 px-2 py-0.5 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}
