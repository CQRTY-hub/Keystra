"use client";

import { useState } from "react";

/**
 * PLAN.md, "Mobile is the primary device": a long key on a narrow screen
 * is close to impossible to select with a thumb, and this is the most
 * important moment in the transaction — it can't be fiddly. 44px minimum
 * tap target (h-11 = 44px in Tailwind's default scale).
 */
export function CopyKeyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (permissions, non-secure
      // context). The key stays visible and selectable regardless —
      // this button is a convenience, never the only way to get it.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-11 shrink-0 items-center justify-center rounded border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {copied ? "Gekopieerd!" : "Kopiëren"}
      <span className="sr-only"> naar klembord</span>
    </button>
  );
}
