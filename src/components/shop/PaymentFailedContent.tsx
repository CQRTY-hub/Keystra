"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

function PaymentFailedInner() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const t = getMessages();

  return (
    <div className="max-w-md">
      <PageTitleBand title={t.paymentFailed.title} />
      <p className="text-body-md mt-4 text-secondary">{t.paymentFailed.body}</p>
      <div className="mt-6 flex gap-4">
        {/* Retrying re-enters checkout, it isn't itself the buy action —
            stays secondary, same reasoning as cart's "go to checkout". */}
        <Link
          href="/checkout"
          className="text-title-sm inline-flex items-center justify-center rounded-keystra border border-secondary px-4 py-2 text-secondary hover:bg-container"
        >
          {t.paymentFailed.retry}
        </Link>
        <Link href="/cart" className="flex items-center text-secondary underline hover:text-primary">
          {t.paymentFailed.backToCart}
        </Link>
      </div>
      {orderId && (
        <p className="text-body-md mt-4 text-secondary">Order {orderId}</p>
      )}
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
