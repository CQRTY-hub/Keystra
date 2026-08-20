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
      /** Link to retrieve the code once it exists. */
      retrievalUrl: string;
    }
  | {
      status: "failed";
      reason: "out_of_stock" | "empty_balance" | "timeout" | "unknown";
      message: string;
    };

export interface FulfillmentProvider {
  checkAvailability(productId: string): Promise<AvailabilityResult>;
  orderKey(productId: string, orderId: string): Promise<KeyResult>;
}
