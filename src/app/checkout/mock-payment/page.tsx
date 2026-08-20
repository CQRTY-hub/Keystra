"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Stands in for Mollie's hosted payment page (PLAN.md: "Payments: Mollie
 * — not yet connected — stub it this phase, same pattern as
 * fulfillment"). Phase 3 replaces this whole page with a redirect to
 * Mollie's real checkout URL; nothing downstream (the webhook route,
 * fulfilment, confirmation) needs to change shape when that happens.
 */
function MockPaymentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("orderId") ?? "";

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

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">Mock-betaalpagina</h1>
      <p className="mt-2 text-slate-700">
        Dit staat in voor de echte Mollie-betaalpagina, die in Phase 3
        wordt aangesloten. Er wordt nu geen echt geld gevraagd.
      </p>
      <div className="mt-6">
        <Button type="button" onClick={pay} disabled={status === "paying"}>
          {status === "paying" ? "Bezig..." : "Betaal (mock)"}
        </Button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          Er ging iets mis bij het simuleren van de betaling.
        </p>
      )}
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense>
      <MockPaymentContent />
    </Suspense>
  );
}
