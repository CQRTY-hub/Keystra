import type { ReactNode } from "react";

/**
 * DESIGN.md, Labels & Badges > Tag Label: Label Caps text in Secondary
 * (#45a29e) on Container, 2px radius. Plain by design — no colour-coded
 * urgency, no "🔥 HOT DEAL" styling, that's exactly what the brand brief's
 * anti-references rule out. This just labels a fact: category, region.
 * Never cyan — see the primary-cyan usage rule in DESIGN.md.
 */
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="text-label-caps inline-block rounded-[2px] bg-container px-2 py-1 text-secondary">
      {children}
    </span>
  );
}
