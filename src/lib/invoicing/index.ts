import { prisma } from "@/lib/prisma";
import { logEvent } from "@/lib/event-log";
import { nextInvoiceNumber } from "./invoice-number";
import { generateInvoicePdf } from "./generate-invoice-pdf";

export { generateInvoicePdf } from "./generate-invoice-pdf";

/**
 * Called once, from the webhook route, right after a payment is
 * confirmed (PLAN.md, Phase 3.6: number assigned at payment confirmation,
 * not at key delivery — delivery can still fail after this). Number and
 * PDF are both generated and stored here, in the same transaction, so
 * an invoice row never exists without a number or a PDF half-written.
 *
 * The PDF isn't emailed here — src/lib/email/types.ts's `includesInvoice`
 * flag is set on the email actually sent once the order reaches
 * `completed` (see the webhook route), matching how `includesKey` is
 * already deferred to send time rather than resolved at payment time.
 * Until Phase 3.6's real email provider exists, the customer's own route
 * to it is /api/invoices/[orderId] — the same trust boundary as the
 * order confirmation page itself already uses (knowing the order ID).
 *
 * Idempotent: if an order somehow already has an invoice (shouldn't
 * happen — decideWebhookAction only lets a `pending` order reach this
 * code once — but never silently mint a second number for one order),
 * this returns the existing one instead of creating another.
 */
export async function issueInvoiceForOrder(orderId: string): Promise<void> {
  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return;

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order.customerName || !order.customerAddress || !order.customerCountry) {
    // Every order placed through the current checkout form has all
    // three (see the checkout route's zod schema) — this only fires for
    // an order placed before that field existed. Logged, not thrown:
    // a missing invoice must never block payment confirmation or
    // fulfilment, which is exactly the "never let a side concern hold up
    // the main flow" instinct this codebase applies everywhere else
    // (see risk-decision.ts's fail-closed-but-non-blocking pattern).
    await logEvent({
      orderId,
      eventType: "invoice.skipped_missing_customer_details",
      payload: {},
    });
    return;
  }

  // Number, PDF, and the row that stores them are all produced inside
  // one transaction — the PDF's own content includes the invoice number
  // (see generate-invoice-pdf.ts), so the number can't be known before
  // rendering it, and it must not be "spent" unless the invoice that
  // uses it actually gets written (nextInvoiceNumber()'s own comment).
  // Rendering a single-page PDF is fast, in-memory, CPU-only work — well
  // inside Prisma's interactive-transaction timeout.
  const issuedAt = new Date();

  const { number, pdf } = await prisma.$transaction(async (tx) => {
    const number = await nextInvoiceNumber(tx);
    const pdfBuffer = await generateInvoicePdf({
      invoiceNumber: number,
      issuedAt,
      orderId: order.id,
      customerName: order.customerName!,
      customerAddress: order.customerAddress!,
      customerCountry: order.customerCountry!,
      customerEmail: order.customerEmail,
      lines: order.items.map((item) => ({
        title: item.product.title,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
      totalCents: order.totalCents,
    });
    await tx.invoice.create({
      data: { orderId: order.id, number, issuedAt, pdf: pdfBuffer },
    });
    return { number, pdf: pdfBuffer };
  });

  await logEvent({
    orderId,
    eventType: "invoice.issued",
    payload: { invoiceNumber: number, pdfBytes: pdf.length },
  });
}
