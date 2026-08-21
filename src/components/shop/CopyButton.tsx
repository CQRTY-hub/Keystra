"use client";

import { useState } from "react";
import { getMessages } from "@/i18n";

/**
 * Generic copy-to-clipboard button — used for both the delivered key and
 * the order number on the confirmation page. PLAN.md, "Mobile is the
 * primary device": a long value on a narrow screen is close to
 * impossible to select with a thumb. 44px minimum tap target (h-11 =
 * 44px in Tailwind's default scale).
 */
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const t = getMessages();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (permissions, non-secure
      // context). The value stays visible and selectable regardless —
      // this button is a convenience, never the only way to get it.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-11 shrink-0 items-center justify-center rounded border border-slate-300 px-4 text-sm font-medium hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      {copied ? t.copyButton.copied : t.copyButton.copy}
      <span className="sr-only">{t.copyButton.srSuffix}</span>
    </button>
  );
}
