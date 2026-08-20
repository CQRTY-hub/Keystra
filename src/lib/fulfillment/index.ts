import type { FulfillmentProvider } from "./types";
import { MockFulfillmentProvider } from "./mock-provider";
import { CodesWholesaleProvider } from "./codeswholesale-provider";

export type { FulfillmentProvider, AvailabilityResult, KeyResult, CodeType } from "./types";
export { MOCK_SCENARIO_PRODUCT_IDS } from "./mock-provider";

/**
 * The only place that decides which provider is live. Everything else
 * imports `getFulfillmentProvider()` and never imports MockFulfillmentProvider
 * or CodesWholesaleProvider directly.
 */
export function getFulfillmentProvider(): FulfillmentProvider {
  const selected = process.env.FULFILLMENT_PROVIDER ?? "mock";

  switch (selected) {
    case "mock":
      return new MockFulfillmentProvider();
    case "codeswholesale":
      return new CodesWholesaleProvider();
    default:
      throw new Error(
        `Unknown FULFILLMENT_PROVIDER "${selected}". Expected "mock" or "codeswholesale".`
      );
  }
}
