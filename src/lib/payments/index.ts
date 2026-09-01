import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock-provider";
import { MollieProvider } from "./mollie-provider";

export type {
  PaymentProvider,
  CreatePaymentInput,
  CreatePaymentResult,
  GetPaymentResult,
  PaymentStatus,
} from "./types";

/**
 * The only place that decides which payment provider is live — same
 * pattern as src/lib/fulfillment/index.ts's getFulfillmentProvider().
 * Everything else imports getPaymentProvider() and never imports
 * MockPaymentProvider or MollieProvider directly.
 */
export function getPaymentProvider(): PaymentProvider {
  const selected = process.env.PAYMENT_PROVIDER ?? "mock";

  switch (selected) {
    case "mock":
      return new MockPaymentProvider();
    case "mollie":
      return new MollieProvider();
    default:
      throw new Error(
        `Unknown PAYMENT_PROVIDER "${selected}". Expected "mock" or "mollie".`
      );
  }
}
