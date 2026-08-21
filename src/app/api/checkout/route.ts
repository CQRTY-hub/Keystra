import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isCheckoutEnabled } from "@/lib/kill-switch";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { createPayment } from "@/lib/payments/mollie-stub";
import { recordCheckoutConsent } from "@/lib/consent";
import { logEvent } from "@/lib/event-log";
import { getMessages } from "@/i18n";

const t = getMessages();

const checkoutSchema = z.object({
  email: z.string().email(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1),
  termsAccepted: z.literal(true),
  withdrawalWaiverAccepted: z.literal(true),
});

/**
 * Prices and availability are re-checked here, server-side, regardless of
 * what the browser's cart or a cached product page said (PLAN.md,
 * "Rendering"). The client never sends a price — only productId and
 * quantity — so there's nothing to trust or distrust on that front.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: t.api.checkout.invalidRequest },
      { status: 400 }
    );
  }

  if (!(await isCheckoutEnabled())) {
    return NextResponse.json(
      { message: t.api.checkout.paused },
      { status: 403 }
    );
  }

  const { email, items, termsAccepted, withdrawalWaiverAccepted } =
    parsed.data;

  const fulfillment = getFulfillmentProvider();

  // Look up every product server-side and re-price it against the
  // supplier — never the price the client happened to have cached.
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, active: true },
  });

  if (products.length !== items.length) {
    // A cart can reference a productId the DB no longer has — the
    // product was deactivated, or (Phase 1, most likely) the browser
    // held onto a stale cart across a reseed. Tell the client exactly
    // which ids didn't resolve, so it can drop just those instead of
    // leaving the whole cart permanently stuck on a dead-end error.
    const foundIds = new Set(products.map((p) => p.id));
    const invalidProductIds = items
      .map((i) => i.productId)
      .filter((id) => !foundIds.has(id));

    return NextResponse.json(
      { message: t.api.checkout.productsUnavailable, invalidProductIds },
      { status: 409 }
    );
  }

  const orderLines: {
    productId: string;
    quantity: number;
    unitPriceCents: number;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    // The fulfillment provider is only the source of truth for
    // AVAILABILITY here — its priceCents is the supplier's cost feed
    // (what we pay), not what we charge. What we charge is our own
    // current Product.priceCents, just re-read from the DB above so an
    // admin price change is always reflected, never a stale cached page.
    const availability = await fulfillment.checkAvailability(
      product.supplierProductId
    );
    if (!availability.available) {
      return NextResponse.json(
        {
          message: t.api.checkout.productOutOfStock(product.title),
          invalidProductIds: [product.id],
        },
        { status: 409 }
      );
    }
    orderLines.push({
      productId: product.id,
      quantity: item.quantity,
      unitPriceCents: product.priceCents,
    });
  }

  const totalCents = orderLines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0
  );

  const order = await prisma.order.create({
    data: {
      customerEmail: email,
      totalCents,
      items: {
        create: orderLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
        })),
      },
    },
  });

  await recordCheckoutConsent({
    orderId: order.id,
    termsAccepted,
    withdrawalWaiverAccepted,
  });

  const payment = await createPayment({
    orderId: order.id,
    amountCents: totalCents,
    currency: "EUR",
    description: t.api.checkout.orderDescription(order.id),
    redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/order/confirmation/${order.id}`,
    webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mollie`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { molliePaymentId: payment.molliePaymentId },
  });

  await logEvent({
    orderId: order.id,
    eventType: "order.created",
    payload: { email, totalCents, itemCount: orderLines.length },
  });

  return NextResponse.json({
    orderId: order.id,
    checkoutUrl: payment.checkoutUrl,
  });
}
