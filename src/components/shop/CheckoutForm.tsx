"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { formatPriceCents } from "@/lib/currency";
import { WITHDRAWAL_WAIVER_TEXT } from "@/lib/consent-text";
import { getMessages } from "@/i18n";

/**
 * Two separate, independently-required checkboxes — terms and the
 * withdrawal-right waiver — both unticked by default (PLAN.md Phase 1
 * point 6). The submit button's wording ("Order with obligation to pay")
 * is required under EU distance-selling rules; it must not say
 * "Continue" or "Confirm" (Appendix, "Checkout and pricing mechanics").
 */
export function CheckoutForm() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();
  const t = getMessages();

  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    items.length > 0 && email.length > 0 && termsAccepted && waiverAccepted;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          termsAccepted,
          withdrawalWaiverAccepted: waiverAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? t.checkout.genericError);
        return;
      }

      clear();
      router.push(data.checkoutUrl);
    } catch {
      setError(t.checkout.connectionError);
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-slate-700">{t.checkout.emptyCart}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-6">
      <Input
        id="email"
        label={t.checkout.email}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      {/* PLAN.md, "Mobile is the primary device": 44px minimum tap target,
          especially these two — a consent checkbox that's hard to hit is
          one people mis-tap. The whole row is the label (clicking the
          text toggles the box too); the icon wrapper additionally gives
          the checkbox glyph itself a full 44x44 hit area, not just its
          visible ~16px square. */}
      <label htmlFor="terms" className="flex min-h-11 cursor-pointer items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-5 w-5"
          />
        </span>
        <span className="py-3 text-sm text-slate-900">
          {t.checkout.termsPrefix}
          <a href="/terms" className="underline" target="_blank" rel="noreferrer">
            {t.checkout.termsLink}
          </a>
          {t.checkout.termsSuffix}
        </span>
      </label>

      <label
        htmlFor="withdrawal-waiver"
        className="flex min-h-11 cursor-pointer items-start gap-3"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center">
          <input
            id="withdrawal-waiver"
            type="checkbox"
            checked={waiverAccepted}
            onChange={(e) => setWaiverAccepted(e.target.checked)}
            className="h-5 w-5"
          />
        </span>
        <span className="py-3 text-sm text-slate-900">{WITHDRAWAL_WAIVER_TEXT}</span>
      </label>

      <p className="text-lg font-medium">{t.checkout.total(formatPriceCents(totalCents))}</p>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={!canSubmit || submitting}>
        {submitting ? t.checkout.submitting : t.checkout.submit}
      </Button>
    </form>
  );
}
