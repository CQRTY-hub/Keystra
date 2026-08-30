"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";
import { useCart } from "@/lib/cart-context";

/**
 * Stands in for Mollie's hosted payment page (PLAN.md: "Payments: Mollie
 * — not yet connected — stub it this phase, same pattern as
 * fulfillment"). Phase 3 replaces this whole page with a redirect to
 * Mollie's real checkout URL; nothing downstream (the webhook route,
 * fulfilment, confirmation) needs to change shape when that happens.
 *
 * The cancel button stands in for a declined or abandoned real Mollie
 * payment — it sends the browser to /checkout/payment-failed exactly
 * the way Mollie would redirect there for real, without ever calling
 * the webhook route. The order is left `pending`; nothing was charged.
 * The cart is deliberately still intact at that point — see clear()
 * below for why.
 */
function MockPaymentInner() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId") ?? "";
  const t = getMessages();
  const { clear } = useCart();

  const [status, setStatus] = useState<"idle" | "paying" | "error">("idle");

  async function pay() {
    setStatus("paying");
    try {
      const res = await fetch("/api/webhooks/mollie", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=mock_mollie_${orderId}`,
      });
      if (!res.ok) throw new Error("webhook failed");
      // Only clear the cart once payment is actually confirmed — not at
      // order-creation time. Clearing earlier meant a cancelled or failed
      // payment left the shopper with an empty cart and no way to "Try
      // again" (PLAN.md, "Payment failed / cancelled": "offer to retry").
      clear();
      router.push(`/order/confirmation/${orderId}`);
    } catch {
      setStatus("error");
    }
  }

  function cancel() {
    router.push(`/checkout/payment-failed?orderId=${orderId}`);
  }

  return (
    <div className="max-w-md">
      <PageTitleBand title={t.mockPayment.title} />
      <p className="text-body-md mt-4 text-secondary">{t.mockPayment.body}</p>
      <div className="mt-6 flex gap-2">
        <Button type="button" variant="primary" onClick={pay} disabled={status === "paying"}>
          {status === "paying" ? t.mockPayment.paying : t.mockPayment.pay}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={cancel}
          disabled={status === "paying"}
        >
          {t.mockPayment.cancel}
        </Button>
      </div>
      {status === "error" && (
        <p role="alert" className="text-body-md mt-4 text-danger">
          {t.mockPayment.error}
        </p>
      )}
    </div>
  );
}

export function MockPaymentContent() {
  return (
    <Suspense>
      <MockPaymentInner />
    </Suspense>
  );
}
