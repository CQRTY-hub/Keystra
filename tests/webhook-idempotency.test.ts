import { describe, expect, it } from "vitest";
import { OrderStatus } from "@prisma/client";
import { decideWebhookAction } from "@/lib/webhooks";

describe("webhook idempotency", () => {
  it("processes a payment notification for a still-pending order", () => {
    const decision = decideWebhookAction({
      currentStatus: OrderStatus.pending,
    });
    expect(decision.action).toBe("process");
  });

  it("ignores a duplicate notification once the order has moved past pending", () => {
    const alreadyMoved: OrderStatus[] = [
      OrderStatus.paid,
      OrderStatus.fulfilling,
      OrderStatus.completed,
      OrderStatus.awaiting_code,
      OrderStatus.held,
      OrderStatus.refunded,
    ];

    for (const status of alreadyMoved) {
      const decision = decideWebhookAction({ currentStatus: status });
      expect(decision.action).toBe("ignore_duplicate");
    }
  });

  it("the same payment notification arriving twice never processes twice", () => {
    // First arrival: order is pending.
    const first = decideWebhookAction({ currentStatus: OrderStatus.pending });
    expect(first.action).toBe("process");

    // In the real route, processing the first arrival moves the order to
    // "paid" before the second webhook delivery (Mollie retries) is
    // handled. Simulate that here.
    const second = decideWebhookAction({ currentStatus: OrderStatus.paid });
    expect(second.action).toBe("ignore_duplicate");
  });

  it("ignores a notification for a payment ID that matches no order", () => {
    const decision = decideWebhookAction({ currentStatus: null });
    expect(decision.action).toBe("ignore_unknown_order");
  });
});
