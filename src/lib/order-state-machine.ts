import { OrderStatus } from "@prisma/client";

/**
 * The explicit state machine for Order.status (PLAN.md, "Data model").
 * An order must never skip states, and nothing outside this module should
 * decide whether a transition is legal — call `assertTransition` (or
 * `canTransition`) before every `prisma.order.update({ data: { status } })`.
 *
 * Main path:   pending -> paid -> fulfilling -> completed
 * Side exits:  held, awaiting_code, refunded
 *
 * `awaiting_code` is not an error. CodesWholesale can accept an order and
 * return no key yet (their CODE_PREORDER type) — the money is taken, the
 * order is valid, the key arrives later. It resolves automatically back
 * into `completed` once the code lands.
 */

export { OrderStatus };

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: [OrderStatus.paid, OrderStatus.held],
  paid: [OrderStatus.fulfilling, OrderStatus.held],
  fulfilling: [OrderStatus.completed, OrderStatus.awaiting_code, OrderStatus.held],
  awaiting_code: [OrderStatus.completed, OrderStatus.held],
  completed: [OrderStatus.refunded],
  held: [OrderStatus.refunded, OrderStatus.fulfilling],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export class InvalidOrderTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Illegal order status transition: ${from} -> ${to}`);
    this.name = "InvalidOrderTransitionError";
  }
}

/**
 * Throws if the transition isn't allowed. Call this before every status
 * write so a bug can never silently move an order through an impossible
 * path (e.g. pending -> completed, skipping payment and fulfilment).
 */
export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidOrderTransitionError(from, to);
  }
}
