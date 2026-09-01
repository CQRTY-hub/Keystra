import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/currency";
import { CopyButton } from "@/components/shop/CopyButton";
import { ClearCartOnComplete } from "@/components/shop/ClearCartOnComplete";
import { PageTitleBand } from "@/components/PageTitleBand";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.orderConfirmed,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic"; // can contain a key — never cache

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: true, deliveredKeys: true },
      },
      invoice: true,
    },
  });

  if (!order) notFound();

  // A `pending` order isn't necessarily still being processed — Mollie
  // redirects here for a declined card or an abandoned/expired attempt
  // too (only an explicit cancel-on-Mollie's-page goes to
  // /checkout/payment-failed instead — see the checkout route's
  // cancelUrl). The webhook still logs those outcomes even though it
  // deliberately leaves Order.status at `pending` (see that route's own
  // comment), so this checks for that instead of showing "we're
  // processing your order" forever for a payment that will never
  // complete.
  const paymentFailedEvent =
    order.status === "pending"
      ? await prisma.eventLog.findFirst({
          where: {
            orderId: order.id,
            eventType: { in: ["payment.failed", "payment.expired", "payment.canceled"] },
          },
          orderBy: { createdAt: "desc" },
        })
      : null;

  if (paymentFailedEvent) {
    return (
      <div>
        <PageTitleBand title={t.paymentFailed.title} />
        <p className="text-body-md mt-4 text-secondary">{t.paymentFailed.body}</p>
        <div className="mt-6 flex gap-4">
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
      </div>
    );
  }

  return (
    <div>
      <PageTitleBand title={t.confirmation.title} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-body-md text-secondary">{t.confirmation.orderNumberLabel}:</span>
        <span className="text-body-md font-mono text-on-surface">{order.id}</span>
        <CopyButton value={order.id} />
      </div>
      <p className="text-body-md mt-1 text-secondary">
        {t.confirmation.statusLabel(order.status)}
      </p>

      {/* Cart cleared from `paid` onward, not just `completed`: any of
          these three statuses means the payment already succeeded, so
          leaving the old cart in place risks the shopper re-ordering
          (and paying for) the same item a second time while this one is
          still being sorted out. */}
      {(order.status === "held" ||
        order.status === "awaiting_code" ||
        order.status === "completed") && <ClearCartOnComplete />}

      {order.status === "held" && (
        <p className="text-body-md mt-4 rounded-keystra border border-outline bg-container p-4 text-on-surface">
          {t.confirmation.heldBody(order.customerEmail)}
        </p>
      )}

      {order.status === "awaiting_code" && (
        <p className="text-body-md mt-4 rounded-keystra border border-outline bg-container p-4 text-on-surface">
          {t.confirmation.awaitingCodeBody(order.customerEmail)}
        </p>
      )}

      {order.status === "completed" && (
        <div className="mt-6">
          <p className="text-body-md text-secondary">
            {t.confirmation.completedEmailedTo(order.customerEmail)}
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="rounded-keystra border border-outline bg-container p-4"
              >
                <p className="text-title-sm text-on-surface">{item.product.title}</p>
                <p className="text-body-md text-secondary">
                  {formatPriceCents(item.unitPriceCents)}
                </p>
                {item.deliveredKeys.map((key) =>
                  key.deliveryMethod === "text" ? (
                    <div
                      key={key.id}
                      className="mt-2 flex flex-wrap items-center gap-2 rounded-keystra border border-outline bg-container-lowest p-2"
                    >
                      <p className="min-w-0 flex-1 break-all font-mono text-sm text-on-surface">
                        {key.value}
                      </p>
                      <CopyButton value={key.value} />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={key.id}
                      src={`data:image/png;base64,${key.value}`}
                      alt={t.confirmation.keyImageAlt(item.product.title)}
                      className="mt-2 max-w-xs rounded-keystra border border-outline"
                    />
                  )
                )}
              </li>
            ))}
          </ul>
          {order.invoice && (
            <p className="mt-4">
              <a
                href={`/api/invoices/${order.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-secondary underline hover:text-primary"
              >
                {t.confirmation.downloadInvoice}
              </a>
            </p>
          )}
        </div>
      )}

      {(order.status === "pending" ||
        order.status === "paid" ||
        order.status === "fulfilling") && (
        <p className="text-body-md mt-4 text-secondary">{t.confirmation.processing}</p>
      )}
    </div>
  );
}
