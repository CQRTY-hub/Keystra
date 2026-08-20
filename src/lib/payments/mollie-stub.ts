/**
 * Payments stub — same pattern as fulfillment: the shape is real, nothing
 * behind it is wired to live Mollie yet. Phase 3 replaces the bodies of
 * these functions with real `@mollie/api-client` calls; the call sites
 * (checkout, the webhook route) should not need to change shape.
 */

export interface CreatePaymentInput {
  orderId: string;
  amountCents: number;
  currency: "EUR";
  description: string;
  redirectUrl: string;
  webhookUrl: string;
}

export interface CreatePaymentResult {
  molliePaymentId: string;
  checkoutUrl: string;
}

export async function createPayment(
  input: CreatePaymentInput
): Promise<CreatePaymentResult> {
  // TODO(Phase 3): call Mollie's Payments API with a real API key.
  // Until then, checkout must not claim a real payment happened.
  return {
    molliePaymentId: `mock_mollie_${input.orderId}`,
    checkoutUrl: `/checkout/mock-payment?orderId=${input.orderId}`,
  };
}

export interface WebhookVerificationResult {
  valid: boolean;
  molliePaymentId: string | null;
}

/**
 * TODO(Phase 3): verify the incoming webhook actually came from Mollie
 * (fetch the payment by ID from Mollie's API — Mollie webhooks carry no
 * signature, so the standard approach is to re-fetch and trust that).
 * Never trust a webhook body's status field on its own.
 */
export async function verifyWebhook(
  molliePaymentId: string
): Promise<WebhookVerificationResult> {
  return { valid: true, molliePaymentId };
}
