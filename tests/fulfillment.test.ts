import { describe, expect, it } from "vitest";
import {
  MockFulfillmentProvider,
  MOCK_SCENARIO_PRODUCT_IDS,
} from "@/lib/fulfillment/mock-provider";

describe("MockFulfillmentProvider", () => {
  const provider = new MockFulfillmentProvider();
  const orderId = "order-123";

  it("delivers a normal CODE_TEXT key for an ordinary product", async () => {
    const result = await provider.orderKey("some-real-product-id", orderId);
    expect(result.status).toBe("delivered");
    if (result.status === "delivered" && result.codeType === "CODE_TEXT") {
      expect(result.value).toMatch(/^MOCK-/);
    } else {
      throw new Error("expected a CODE_TEXT delivery");
    }
  });

  it("reports the out-of-stock product as unavailable", async () => {
    const availability = await provider.checkAvailability(
      MOCK_SCENARIO_PRODUCT_IDS.outOfStock
    );
    expect(availability.available).toBe(false);
  });

  it("fails an order for the out-of-stock product", async () => {
    const result = await provider.orderKey(
      MOCK_SCENARIO_PRODUCT_IDS.outOfStock,
      orderId
    );
    expect(result).toMatchObject({ status: "failed", reason: "out_of_stock" });
  });

  it("fails an order for the empty-balance product", async () => {
    const result = await provider.orderKey(
      MOCK_SCENARIO_PRODUCT_IDS.emptyBalance,
      orderId
    );
    expect(result).toMatchObject({
      status: "failed",
      reason: "empty_balance",
    });
  });

  it("fails an order for the timeout product", async () => {
    const result = await provider.orderKey(
      MOCK_SCENARIO_PRODUCT_IDS.timeout,
      orderId
    );
    expect(result).toMatchObject({ status: "failed", reason: "timeout" });
  });

  it("delivers a CODE_IMAGE key as base64 with a fileName", async () => {
    const result = await provider.orderKey(
      MOCK_SCENARIO_PRODUCT_IDS.imageKey,
      orderId
    );
    expect(result.status).toBe("delivered");
    if (result.status === "delivered" && result.codeType === "CODE_IMAGE") {
      expect(result.valueBase64.length).toBeGreaterThan(0);
      expect(result.fileName).toContain(orderId);
    } else {
      throw new Error("expected a CODE_IMAGE delivery");
    }
  });

  it("returns awaiting_code for a successful order with no code yet", async () => {
    const result = await provider.orderKey(
      MOCK_SCENARIO_PRODUCT_IDS.awaitingCode,
      orderId
    );
    expect(result.status).toBe("awaiting_code");
    if (result.status === "awaiting_code") {
      expect(result.codeType).toBe("CODE_PREORDER");
      expect(result.retrievalUrl).toContain(orderId);
    }
  });
});
