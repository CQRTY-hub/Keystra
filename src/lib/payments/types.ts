/**
 * The one interface every payment integration implements — same pattern
 * as src/lib/fulfillment/types.ts. Nothing else in the app may know
 * whether it's talking to the mock or to real Mollie; that's decided
 * once, in index.ts, by an env var (PAYMENT_PROVIDER).
 */

export interface CreatePaymentInput {
  orderId: string;
  amountCents: number;
  currency: "EUR";
  description: string;
  /** Customer email as typed at checkout — used for Mollie's billingAddress, not identity. */
  customerEmail: string;
  /** Where Mollie sends the customer back after a completed (or abandoned) payment. */
  redirectUrl: string;
  /** Where Mollie sends the customer back if they explicitly cancel on the hosted payment page. */
  cancelUrl: string;
  webhookUrl: string;
}

export interface CreatePaymentResult {
  molliePaymentId: string;
  checkoutUrl: string;
}

/**
 * Mirrors the payment statuses Mollie's webhook actually fires for (see
 * mollie-provider.ts's own comment) plus "unknown" for anything this
 * provider doesn't recognise — never silently treated as paid.
 */
export type PaymentStatus =
  | "paid"
  | "authorized"
  | "failed"
  | "expired"
  | "canceled"
  | "open"
  | "pending"
  | "unknown";

export interface GetPaymentResult {
  status: PaymentStatus;
  /**
   * The email Mollie actually charged, when the payment method reports
   * one — e.g. a PayPal payment's own account email. Not available for
   * every method (iDEAL/Bancontact report an IBAN there instead, credit
   * cards report neither) — see mollie-provider.ts for how this is
   * derived. A mismatch with the shopper's checkout email is the
   * strongest fraud signal CodesWholesale's risk check takes (PLAN.md,
   * Phase 3.6) — see RiskAssessmentInput.customerPaymentEmail.
   */
  payerEmail?: string;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  /**
   * Called from the webhook route with the payment ID Mollie's webhook
   * body names — never trust the webhook body's own claimed status, only
   * this. Throws if the payment can't be found/fetched at all (a
   * genuinely invalid webhook, not a status the app just doesn't handle
   * yet), which the route turns into a 400.
   */
  getPayment(molliePaymentId: string): Promise<GetPaymentResult>;
}
