import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isCheckoutEnabled } from "@/lib/kill-switch";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { getPaymentProvider } from "@/lib/payments";
import { recordCheckoutConsent } from "@/lib/consent";
import { logEvent } from "@/lib/event-log";
import { getClientIp } from "@/lib/request-ip";
import { getMessages } from "@/i18n";

const t = getMessages();

const checkoutSchema = z.object({
  email: z.string().email(),
  // Billing details, for the invoice only (src/lib/invoicing) — never
  // used for delivery, since everything here is digital. Required for
  // every order placed from here on; existing orders that predate this
  // field just don't get an invoice (see issueInvoiceForOrder's own
  // guard).
  customerName: z.string().trim().min(1),
  customerAddress: z.string().trim().min(1),
  customerCountry: z.string().trim().min(1),
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

  const { items, termsAccepted, withdrawalWaiverAccepted } = parsed.data;
  const customerName = parsed.data.customerName.trim();
  const customerAddress = parsed.data.customerAddress.trim();
  const customerCountry = parsed.data.customerCountry.trim();
  // Normalized once, here, so every downstream use (the stored order,
  // the confirmation/held/awaiting-code emails, order lookup later) is
  // consistent regardless of how the shopper capitalized it. Order
  // lookup also compares case-insensitively as a second line of defence
  // for orders that predate this normalization.
  const email = parsed.data.email.trim().toLowerCase();

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
      customerName,
      customerAddress,
      customerCountry,
      totalCents,
      // Captured now, not reconstructable later — see the schema
      // comment on Order.customerIpAddress. This is what the payment
      // webhook's risk check (assessRisk()) reads before fulfilment.
      customerIpAddress: getClientIp(req.headers),
      customerUserAgent: req.headers.get("user-agent") ?? undefined,
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

  const payment = await getPaymentProvider().createPayment({
    orderId: order.id,
    amountCents: totalCents,
    currency: "EUR",
    description: t.api.checkout.orderDescription(order.id),
    customerEmail: email,
    redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/order/confirmation/${order.id}`,
    // Only reached if the shopper explicitly cancels on Mollie's hosted
    // payment page — a declined card or an abandoned/expired attempt
    // still goes to redirectUrl above, per Mollie's own redirect rules
    // (see mollie-provider.ts's header comment). The confirmation page
    // already handles a still-`pending` order gracefully either way.
    cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/payment-failed?orderId=${order.id}`,
    // MOLLIE_WEBHOOK_URL_OVERRIDE: local-dev-only escape hatch. Mollie
    // rejects payment creation outright if webhookUrl isn't reachable
    // from Mollie's own servers (confirmed 2026-09-01 testing against
    // the real sandbox: a 422 "unreachable from Mollie's point of view"
    // on localhost) — and localhost never is. Once deployed (Task 3),
    // NEXT_PUBLIC_SITE_URL is itself a real public URL and this env var
    // should simply not be set; this line is then a no-op.
    webhookUrl: `${process.env.MOLLIE_WEBHOOK_URL_OVERRIDE ?? process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mollie`,
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
