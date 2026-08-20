/**
 * The one interface every supplier integration implements. Nothing else
 * in the app may know whether it's talking to the mock or to
 * CodesWholesale — that's decided once, in index.ts, by an env var.
 *
 * Products are always identified by `productId` — the supplier's own
 * product ID, never the title. If you find yourself matching a product
 * by name anywhere near this interface, stop and say so.
 */

export type CodeType = "CODE_TEXT" | "CODE_IMAGE" | "CODE_PREORDER";

export interface AvailabilityResult {
  available: boolean;
  /**
   * The SUPPLIER's price in cents, at the purchase-quantity band actually
   * being bought — i.e. what we pay, not what we charge. Feeds the
   * Phase 3.5 repricing rule (margin over this figure), which is what
   * sets Product.priceCents. Checkout charges Product.priceCents, never
   * this field directly — see src/app/api/checkout/route.ts.
   */
  priceCents: number;
}

export interface RiskAssessmentInput {
  orderId: string;
  customerEmail: string;
  amountCents: number;
  ipAddress?: string;
  billingCountry?: string;
}

export interface RiskAssessmentResult {
  /** The supplier's own numeric fraud score for this order. */
  riskScore: number;
  /**
   * CodesWholesale's own suggested hold threshold (PLAN.md, Phase 0.5:
   * "1.5 as their suggested value"). Feeds the risk-based holds in
   * Phase 3.6 — riskScore at or above this sends the order to `held`
   * for manual review instead of fulfilling it.
   */
  suggestedHoldThreshold: number;
}

export type KeyResult =
  | {
      status: "delivered";
      codeType: "CODE_TEXT";
      value: string;
    }
  | {
      status: "delivered";
      codeType: "CODE_IMAGE";
      /** Base64-encoded image data, as returned by the supplier. */
      valueBase64: string;
      fileName: string;
    }
  | {
      status: "awaiting_code";
      codeType: "CODE_PREORDER";
      /**
       * The identifier used to retrieve the code once it exists — the
       * real API is `GET /v3/codes/{codeId}` (PLAN.md, Phase 0.5), not a
       * URL. Whatever persists an `awaiting_code` order needs to store
       * this alongside it; there's nowhere that does yet (Phase 1 only
       * logs the status, not this field — a known gap for whoever builds
       * the resolution job in Phase 3).
       */
      codeId: string;
    }
  | {
      status: "failed";
      reason: "out_of_stock" | "empty_balance" | "timeout" | "unknown";
      message: string;
    };

export interface FulfillmentProvider {
  checkAvailability(productId: string): Promise<AvailabilityResult>;
  orderKey(productId: string, orderId: string): Promise<KeyResult>;
  /**
   * Confirmed by CodesWholesale support (PLAN.md, Phase 0.5): `POST
   * /v3/security` returns a numeric riskScore. Call before fulfilment;
   * a score at or above suggestedHoldThreshold is a Phase 3.6 hold, not
   * a delivery. Part of this interface (not a standalone helper) because
   * it's a supplier-specific fraud signal, same as availability or the
   * key itself — the mock and CodesWholesaleProvider each simulate/call
   * it their own way, and nothing else in the app should know which.
   */
  assessRisk(input: RiskAssessmentInput): Promise<RiskAssessmentResult>;
}
