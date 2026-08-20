"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/cart-context";
import { formatPriceCents } from "@/lib/currency";
import { WITHDRAWAL_WAIVER_TEXT } from "@/lib/consent-text";

/**
 * Two separate, independently-required checkboxes — terms and the
 * withdrawal-right waiver — both unticked by default (PLAN.md Phase 1
 * point 6). The "Bestelling met betalingsverplichting" wording on the
 * submit button is required under EU distance-selling rules; it must not
 * say "Continue" or "Confirm" (Appendix, "Checkout and pricing mechanics").
 */
export function CheckoutForm() {
  const { items, totalCents, clear } = useCart();
  const router = useRouter();

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
        setError(data.message ?? "Er ging iets mis. Probeer het opnieuw.");
        return;
      }

      clear();
      router.push(data.checkoutUrl);
    } catch {
      setError("Kon geen verbinding maken. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-slate-700">Je winkelmandje is leeg.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-6">
      <Input
        id="email"
        label="E-mailadres"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <div className="flex items-start gap-2">
        <input
          id="terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1"
        />
        <label htmlFor="terms" className="text-sm text-slate-900">
          Ik ga akkoord met de{" "}
          <a href="/terms" className="underline" target="_blank" rel="noreferrer">
            algemene voorwaarden
          </a>
          .
        </label>
      </div>

      <div className="flex items-start gap-2">
        <input
          id="withdrawal-waiver"
          type="checkbox"
          checked={waiverAccepted}
          onChange={(e) => setWaiverAccepted(e.target.checked)}
          className="mt-1"
        />
        <label htmlFor="withdrawal-waiver" className="text-sm text-slate-900">
          {WITHDRAWAL_WAIVER_TEXT}
        </label>
      </div>

      <p className="text-lg font-medium">Totaal: {formatPriceCents(totalCents)}</p>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={!canSubmit || submitting}>
        {submitting ? "Bezig..." : "Bestelling met betalingsverplichting"}
      </Button>
    </form>
  );
}
