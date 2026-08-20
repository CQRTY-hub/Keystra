"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMessages } from "@/i18n";

function PaymentFailedInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const t = getMessages();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold">{t.paymentFailed.title}</h1>
      <p className="mt-2 text-slate-700">{t.paymentFailed.body}</p>
      <div className="mt-6 flex gap-4">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          {t.paymentFailed.retry}
        </Link>
        <Link href="/cart" className="inline-flex items-center underline">
          {t.paymentFailed.backToCart}
        </Link>
      </div>
      {orderId && <p className="mt-4 text-sm text-slate-500">Order {orderId}</p>}
    </div>
  );
}

/**
 * PLAN.md, "Pages needed": where Mollie sends the customer back for an
 * abandoned or declined payment. Without this route they land on a 404
 * right after trying to pay, which reads as being scammed — this is
 * purely an explain-and-retry page, no order-state change: a failed or
 * cancelled payment never confirmed, so the order is (and stays)
 * `pending`. Nothing was charged.
 */
export function PaymentFailedContent() {
  return (
    <Suspense>
      <PaymentFailedInner />
    </Suspense>
  );
}
