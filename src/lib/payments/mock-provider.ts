import type {
  CreatePaymentInput,
  CreatePaymentResult,
  GetPaymentResult,
  PaymentProvider,
} from "./types";

/**
 * Stands in for Mollie when PAYMENT_PROVIDER=mock (the default —
 * see index.ts) — same reasoning as MockFulfillmentProvider. Used by
 * local dev and by the automated tests, so it never needs real Mollie
 * credentials or network access. checkoutUrl points at
 * /checkout/mock-payment, a page that stands in for Mollie's hosted
 * checkout (see MockPaymentContent.tsx) — clicking "Pay" there posts to
 * the real webhook route with this provider's molliePaymentId, and
 * getPayment() below always reports that ID as "paid", so the webhook
 * route's real branching logic (paid vs failed/expired/canceled) is
 * exercised the same way it would be with real Mollie, just without a
 * network call.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    return {
      molliePaymentId: `mock_mollie_${input.orderId}`,
      checkoutUrl: `/checkout/mock-payment?orderId=${input.orderId}`,
    };
  }

  async getPayment(): Promise<GetPaymentResult> {
    // The mock payment page only ever calls the webhook after its own
    // "Pay" button — there's no mock path that reports anything other
    // than paid. A cancelled mock payment never touches this at all (see
    // MockPaymentContent.tsx's cancel()), matching real Mollie's own
    // behaviour of only calling the webhook for a completed attempt.
    return { status: "paid" };
  }
}
