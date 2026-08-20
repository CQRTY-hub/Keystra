"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getMessages } from "@/i18n";

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
 */
function MockPaymentInner() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId") ?? "";
  const t = getMessages();

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
      <h1 className="text-2xl font-semibold">{t.mockPayment.title}</h1>
      <p className="mt-2 text-slate-700">{t.mockPayment.body}</p>
      <div className="mt-6 flex gap-2">
        <Button type="button" onClick={pay} disabled={status === "paying"}>
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
        <p role="alert" className="mt-4 text-sm text-red-700">
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
