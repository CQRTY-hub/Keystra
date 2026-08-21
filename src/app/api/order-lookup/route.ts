import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Deliberately simple in Phase 1: order ID + email, same response
 * whether the order exists or the email doesn't match, so this can't be
 * used to probe which order IDs are real. Rate limiting, alerting on
 * repeated failures, and a signed-link alternative are Phase 3.8 work
 * ("Order lookup — the overlooked one") — not skipped, just later.
 */
const lookupSchema = z.object({
  orderId: z.string().min(1),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = lookupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: parsed.data.orderId.trim(),
      // Case-insensitive: email casing carries no meaning to a shopper,
      // and "I typed it correctly but it says not found" because
      // checkout stored "Name@Example.com" and lookup got "name@..."
      // is exactly the kind of self-inflicted lockout self-service
      // order lookup exists to avoid.
      customerEmail: { equals: parsed.data.email.trim(), mode: "insensitive" },
    },
    select: { id: true },
  });

  // Same shape either way — a wrong email and a wrong order ID must look
  // identical from the outside.
  if (!order) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, orderId: order.id });
}
