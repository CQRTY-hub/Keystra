import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { getOrderWithEventLog } from "@/lib/admin/orders";
import { resolveHeldOrderAction } from "@/lib/actions/admin-panel-actions";
import { formatPriceCents } from "@/lib/currency";
import { Button } from "@/components/ui/Button";
import { getMessages } from "@/i18n";

const t = getMessages();

export const metadata: Metadata = {
  title: t.pageTitles.adminOrders,
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAdminSession();

  const { orderId } = await params;
  const order = await getOrderWithEventLog(orderId);
  if (!order) notFound();

  const retryAction = resolveHeldOrderAction.bind(null, orderId, "retry");
  const refundAction = resolveHeldOrderAction.bind(null, orderId, "refund");

  // "The risk score and the reason for a hold have to be visible here" —
  // storefront owner. This is the chargeback defence (per the same
  // request): a reviewer should never have to decode raw EventLog JSON to
  // see why an order was held. eventLogs is already sorted newest-first
  // (getOrderWithEventLog), so .find() gets the latest of each.
  const latestRiskEvent = order.eventLogs.find(
    (e) => e.eventType === "order.risk_assessed" || e.eventType === "order.risk_check_failed"
  );
  const latestHoldEvent = order.eventLogs.find((e) => e.eventType === "order.held");
  const riskPayload = latestRiskEvent?.payload as
    | { riskScore?: number; suggestedHoldThreshold?: number; held?: boolean; message?: string }
    | undefined;
  const holdPayload = latestHoldEvent?.payload as { reason?: string } | undefined;

  return (
    <div>
      <Link href="/admin/orders" className="text-body-md text-secondary hover:text-primary">
        ← {t.admin.orders.backToList}
      </Link>

      <h1 className="text-headline-md mt-2 text-on-surface">{t.admin.orders.detailTitle(order.id)}</h1>
      <p className="text-body-md mt-1 text-secondary">
        {order.customerEmail} — {formatPriceCents(order.totalCents)} —{" "}
        <span className={order.status === "held" ? "text-danger" : ""}>{order.status}</span>
      </p>

      {(latestRiskEvent || latestHoldEvent) && (
        <section className="mt-6 rounded-keystra border border-outline bg-container p-4">
          <h2 className="text-title-sm text-on-surface">{t.admin.orders.riskTitle}</h2>
          <dl className="mt-2 flex flex-col gap-1 text-body-md">
            {latestRiskEvent?.eventType === "order.risk_assessed" && riskPayload && (
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">{t.admin.orders.riskScore}</dt>
                <dd className="tabular-nums text-on-surface">
                  {riskPayload.riskScore} / {t.admin.orders.riskThreshold(riskPayload.suggestedHoldThreshold ?? 0)}
                </dd>
              </div>
            )}
            {latestRiskEvent?.eventType === "order.risk_check_failed" && riskPayload && (
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">{t.admin.orders.riskCheckFailed}</dt>
                <dd className="text-danger">{riskPayload.message ?? "—"}</dd>
              </div>
            )}
            {holdPayload?.reason && (
              <div className="flex justify-between gap-4">
                <dt className="text-secondary">{t.admin.orders.holdReason}</dt>
                <dd className="text-danger">{t.admin.orders.holdReasonText(holdPayload.reason)}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {order.status === "held" && (
        <div className="mt-6 rounded-keystra border border-danger p-4">
          <p className="text-title-sm text-on-surface">{t.admin.orders.resolveTitle}</p>
          <p className="text-body-md mt-2 text-secondary">{t.admin.orders.resolveHint}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="note" className="text-title-sm text-on-surface">
                {t.admin.orders.resolveNote}
              </label>
              <input
                id="note"
                name="note"
                form="resolve-form"
                className="text-body-md rounded-keystra border border-outline bg-container-lowest px-3 py-2 text-on-surface"
              />
            </div>
          </div>
          <form id="resolve-form" className="mt-3 flex gap-2">
            <Button type="submit" formAction={retryAction} variant="secondary">
              {t.admin.orders.retry}
            </Button>
            <Button type="submit" formAction={refundAction} variant="secondary">
              {t.admin.orders.refund}
            </Button>
          </form>
        </div>
      )}

      <section className="mt-8">
        <h2 className="text-title-sm text-on-surface">{t.admin.orders.itemsTitle}</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="text-body-md flex justify-between rounded-keystra border border-outline bg-container p-3"
            >
              <span className="text-on-surface">
                {item.quantity}× {item.product.title}
              </span>
              <span className="tabular-nums text-secondary">
                {formatPriceCents(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-title-sm text-on-surface">{t.admin.orders.eventLogTitle}</h2>
        {order.eventLogs.length === 0 ? (
          <p className="text-body-md mt-2 text-secondary">{t.admin.orders.noEvents}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {order.eventLogs.map((event) => (
              <li
                key={event.id}
                className="rounded-keystra border border-outline bg-container-lowest p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-title-sm text-on-surface">{event.eventType}</span>
                  <span className="text-label-caps text-secondary">
                    {event.createdAt.toLocaleString("en-GB")}
                  </span>
                </div>
                <pre className="text-body-md mt-2 overflow-x-auto whitespace-pre-wrap break-words text-secondary">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
