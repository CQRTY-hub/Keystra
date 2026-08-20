import type {
  AvailabilityResult,
  FulfillmentProvider,
  KeyResult,
  RiskAssessmentInput,
  RiskAssessmentResult,
} from "./types";

/**
 * Returns fake keys. Exists so the whole checkout flow can be built and
 * tested before a real supplier is wired in (Phase 3).
 *
 * Every real failure case CodesWholesale can produce is reachable on
 * demand here, keyed off fixed test product IDs — see
 * MOCK_SCENARIO_PRODUCT_IDS below. Any other productId gets a normal
 * successful CODE_TEXT delivery. Use these constants in seed data, in
 * manual QA, and in tests — never hardcode the UUID strings elsewhere.
 */

export const MOCK_SCENARIO_PRODUCT_IDS = {
  outOfStock: "00000000-0000-4000-a000-000000000001",
  emptyBalance: "00000000-0000-4000-a000-000000000002",
  timeout: "00000000-0000-4000-a000-000000000003",
  imageKey: "00000000-0000-4000-a000-000000000004",
  awaitingCode: "00000000-0000-4000-a000-000000000005",
  /**
   * PLAN.md, Phase 0.5: "Faulty keys are NOT an API operation" — a bad
   * key is never detectable at fulfilment time, only discovered later
   * when the customer tries to redeem it. So this scenario delivers
   * NORMALLY (status "delivered", CODE_TEXT) — the order succeeds, same
   * as the default case. The only difference is the value is
   * deliberately recognisable, so once the Phase 3.6 faulty-key claim
   * path exists, this is the fixture to test it against.
   */
  faultyKey: "00000000-0000-4000-a000-000000000006",
} as const;

const MOCK_PRICE_CENTS = 1999;

/**
 * There's no product to key a risk simulation off — CodesWholesale's
 * `POST /v3/security` scores the ORDER (customer, amount, IP), not a
 * product. So the trigger here is the customer email instead. Anything
 * else scores low. CodesWholesale's own suggested hold threshold is 1.5
 * (PLAN.md, Phase 0.5) — the high score here is deliberately above it,
 * the low score deliberately below.
 */
export const MOCK_RISK_SCENARIO_EMAILS = {
  high: "risk-high@mock.test",
} as const;

const MOCK_RISK_HOLD_THRESHOLD = 1.5;

export class MockFulfillmentProvider implements FulfillmentProvider {
  async checkAvailability(productId: string): Promise<AvailabilityResult> {
    if (productId === MOCK_SCENARIO_PRODUCT_IDS.outOfStock) {
      return { available: false, priceCents: MOCK_PRICE_CENTS };
    }
    return { available: true, priceCents: MOCK_PRICE_CENTS };
  }

  async orderKey(productId: string, orderId: string): Promise<KeyResult> {
    switch (productId) {
      case MOCK_SCENARIO_PRODUCT_IDS.outOfStock:
        return {
          status: "failed",
          reason: "out_of_stock",
          message: "Mock: product is out of stock.",
        };

      case MOCK_SCENARIO_PRODUCT_IDS.emptyBalance:
        return {
          status: "failed",
          reason: "empty_balance",
          message: "Mock: supplier account balance is empty.",
        };

      case MOCK_SCENARIO_PRODUCT_IDS.timeout:
        return {
          status: "failed",
          reason: "timeout",
          message: "Mock: supplier call timed out.",
        };

      case MOCK_SCENARIO_PRODUCT_IDS.imageKey:
        return {
          status: "delivered",
          codeType: "CODE_IMAGE",
          // A 1x1 transparent PNG, base64-encoded — enough to exercise the
          // image-delivery code path without a real asset.
          valueBase64:
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          fileName: `mock-key-${orderId}.png`,
        };

      case MOCK_SCENARIO_PRODUCT_IDS.awaitingCode:
        return {
          status: "awaiting_code",
          codeType: "CODE_PREORDER",
          codeId: `mock-code-${orderId}`,
        };

      case MOCK_SCENARIO_PRODUCT_IDS.faultyKey:
        return {
          status: "delivered",
          codeType: "CODE_TEXT",
          value: `MOCK-FAULTY-${orderId.slice(0, 8).toUpperCase()}`,
        };

      default:
        return {
          status: "delivered",
          codeType: "CODE_TEXT",
          value: `MOCK-${productId.slice(0, 8).toUpperCase()}-${orderId
            .slice(0, 8)
            .toUpperCase()}`,
        };
    }
  }

  async assessRisk(input: RiskAssessmentInput): Promise<RiskAssessmentResult> {
    const riskScore =
      input.customerEmail === MOCK_RISK_SCENARIO_EMAILS.high ? 8.5 : 0.4;

    return { riskScore, suggestedHoldThreshold: MOCK_RISK_HOLD_THRESHOLD };
  }
}
