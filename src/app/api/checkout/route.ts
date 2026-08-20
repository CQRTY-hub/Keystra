import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isCheckoutEnabled } from "@/lib/kill-switch";
import { getFulfillmentProvider } from "@/lib/fulfillment";
import { createPayment } from "@/lib/payments/mollie-stub";
import { recordCheckoutConsent } from "@/lib/consent";
import { logEvent } from "@/lib/event-log";

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
      { message: "Ongeldige aanvraag." },
      { status: 400 }
    );
  }

  if (!(await isCheckoutEnabled())) {
    return NextResponse.json(
      { message: "Bestellingen zijn tijdelijk gepauzeerd." },
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
    return NextResponse.json(
      { message: "Een of meer producten zijn niet meer beschikbaar." },
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
    const availability = await fulfillment.checkAvailability(
      product.supplierProductId
    );
    if (!availability.available) {
      return NextResponse.json(
        { message: `"${product.title}" is niet meer op voorraad.` },
        { status: 409 }
      );
    }
    orderLines.push({
      productId: product.id,
      quantity: item.quantity,
      unitPriceCents: availability.priceCents,
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
    description: `Bestelling ${order.id}`,
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
