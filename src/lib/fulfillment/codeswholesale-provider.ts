import type {
  AvailabilityResult,
  FulfillmentProvider,
  KeyResult,
} from "./types";

/**
 * Real implementation — Phase 3, not before. Nothing below is wired up
 * yet. Build against the CodesWholesale sandbox once Phase 0.5's open
 * questions are answered (rate limits, exact token lifetime, whether the
 * risk score is exposed over the API, the faulty-key reporting window).
 *
 * Reminders from PLAN.md that apply specifically here:
 * - OAuth2 client-credentials grant. Store the bearer token in the
 *   database, not in session, and refresh before it expires.
 * - Pricing is tiered by quantity — for one-key-at-a-time fulfilment,
 *   price against the top (most expensive) band, not a blended one.
 * - Faulty keys are NOT an API operation. Never issue a replacement or a
 *   refund from this class — that's the manual support-form path.
 * - Never duplicate or re-issue a key from this provider. One key, one
 *   order, always.
 */
export class CodesWholesaleProvider implements FulfillmentProvider {
  async checkAvailability(_productId: string): Promise<AvailabilityResult> {
    // TODO(Phase 3): GET product details from the sandbox API, read the
    // live `quantity` and the top price band.
    throw new Error("CodesWholesaleProvider is not implemented yet.");
  }

  async orderKey(_productId: string, _orderId: string): Promise<KeyResult> {
    // TODO(Phase 3): POST an order against the sandbox API. Map the
    // response's code type (CODE_TEXT / CODE_IMAGE / CODE_PREORDER) onto
    // KeyResult — do not collapse CODE_PREORDER into a failure, it's a
    // valid "awaiting_code" outcome.
    throw new Error("CodesWholesaleProvider is not implemented yet.");
  }
}
