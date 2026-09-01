import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";
import { OrderStatus, assertTransition } from "@/lib/order-state-machine";

/**
 * PLAN.md Phase 3.5, "Also on the dashboard": "Orders list with status,
 * filterable, and a manual held -> resolved path." There is no separate
 * "resolved" status in the state machine (src/lib/order-state-machine.ts)
 * — resolving a held order means the admin picks one of the two exits
 * `held` already allows: retry fulfilment (held -> fulfilling) or refund
 * (held -> refunded). Both go through assertTransition(), never a raw
 * status write (CLAUDE.md rule 9).
 */

export interface OrderListFilter {
  status?: OrderStatus;
  // Inclusive on both ends. `dateTo` is treated as the END of that day —
  // a shop owner picking "27 Aug" as the end date expects orders placed
  // any time on the 27th to be included, not just before midnight at its
  // start.
  dateFrom?: Date;
  dateTo?: Date;
}

export async function listOrders(filter: OrderListFilter = {}) {
  const { status, dateFrom, dateTo } = filter;

  const createdAt: { gte?: Date; lte?: Date } = {};
  if (dateFrom) createdAt.gte = dateFrom;
  if (dateTo) {
    const endOfDay = new Date(dateTo);
    endOfDay.setHours(23, 59, 59, 999);
    createdAt.lte = endOfDay;
  }

  return prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(dateFrom || dateTo ? { createdAt } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
}

export async function getOrderWithEventLog(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true, deliveredKeys: true } },
      eventLogs: { orderBy: { createdAt: "desc" } },
      invoice: true,
    },
  });
}

/**
 * The held -> resolved action. `outcome: "retry"` sends it back into the
 * normal fulfilment path (held -> fulfilling) — for when the underlying
 * problem (e.g. a supplier timeout) was transient and a real fulfilment
 * attempt should run again. `outcome: "refund"` closes it out (held ->
 * refunded) for when the order can't or shouldn't be fulfilled.
 *
 * This does NOT itself call the payment provider to issue a refund —
 * Mollie isn't wired up for real refunds yet (still a stub, per Phase 1).
 * It records the decision and the status change; actually moving money
 * back is Phase 3.6/3.8 work once Mollie is real.
 */
export async function resolveHeldOrder(
  orderId: string,
  outcome: "retry" | "refund",
  actor: string,
  note?: string
): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error(`Order ${orderId} not found.`);
  if (order.status !== OrderStatus.held) {
    throw new Error(`Order ${orderId} is not held (status: ${order.status}).`);
  }

  const nextStatus = outcome === "retry" ? OrderStatus.fulfilling : OrderStatus.refunded;
  assertTransition(order.status, nextStatus);

  await prisma.order.update({
    where: { id: orderId },
    data: { status: nextStatus },
  });

  await logEvent({
    orderId,
    eventType: "order.status_changed",
    payload: {
      before: order.status,
      after: nextStatus,
      actor,
      reason: `admin resolved held order: ${outcome}${note ? ` — ${note}` : ""}`,
    },
  });
}
