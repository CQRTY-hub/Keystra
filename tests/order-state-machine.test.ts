import { describe, expect, it } from "vitest";
import {
  OrderStatus,
  canTransition,
  assertTransition,
  InvalidOrderTransitionError,
} from "@/lib/order-state-machine";

describe("order state machine", () => {
  it("allows the main happy path", () => {
    expect(canTransition(OrderStatus.pending, OrderStatus.paid)).toBe(true);
    expect(canTransition(OrderStatus.paid, OrderStatus.fulfilling)).toBe(true);
    expect(canTransition(OrderStatus.fulfilling, OrderStatus.completed)).toBe(
      true
    );
  });

  it("allows fulfilling to detour into awaiting_code, then resolve", () => {
    expect(
      canTransition(OrderStatus.fulfilling, OrderStatus.awaiting_code)
    ).toBe(true);
    expect(
      canTransition(OrderStatus.awaiting_code, OrderStatus.completed)
    ).toBe(true);
  });

  it("allows held from every pre-completion state, and a path back out", () => {
    expect(canTransition(OrderStatus.pending, OrderStatus.held)).toBe(true);
    expect(canTransition(OrderStatus.paid, OrderStatus.held)).toBe(true);
    expect(canTransition(OrderStatus.fulfilling, OrderStatus.held)).toBe(
      true
    );
    expect(canTransition(OrderStatus.awaiting_code, OrderStatus.held)).toBe(
      true
    );
    expect(canTransition(OrderStatus.held, OrderStatus.refunded)).toBe(true);
    expect(canTransition(OrderStatus.held, OrderStatus.fulfilling)).toBe(
      true
    );
  });

  it("rejects skipping states", () => {
    expect(canTransition(OrderStatus.pending, OrderStatus.completed)).toBe(
      false
    );
    expect(canTransition(OrderStatus.pending, OrderStatus.fulfilling)).toBe(
      false
    );
    expect(canTransition(OrderStatus.paid, OrderStatus.completed)).toBe(
      false
    );
  });

  it("rejects a no-op transition", () => {
    expect(canTransition(OrderStatus.paid, OrderStatus.paid)).toBe(false);
  });

  it("refunded is terminal", () => {
    expect(canTransition(OrderStatus.refunded, OrderStatus.pending)).toBe(
      false
    );
    expect(canTransition(OrderStatus.refunded, OrderStatus.completed)).toBe(
      false
    );
  });

  it("assertTransition throws InvalidOrderTransitionError on an illegal move", () => {
    expect(() =>
      assertTransition(OrderStatus.pending, OrderStatus.completed)
    ).toThrow(InvalidOrderTransitionError);
  });

  it("assertTransition does not throw on a legal move", () => {
    expect(() =>
      assertTransition(OrderStatus.pending, OrderStatus.paid)
    ).not.toThrow();
  });
});
