import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Serves an order's invoice PDF, if one was issued (src/lib/invoicing).
 * No login required — same trust boundary as the order confirmation page
 * itself, which already shows the delivered key to anyone with the
 * order's URL. Not a weaker point in the app than what already exists;
 * an order ID is effectively a bearer token here, same as everywhere
 * else an orderId appears in a URL.
 *
 * Exists so a customer can get their invoice today, even though the real
 * email provider (Phase 3.6, still a mock/logger) doesn't actually send
 * attachments yet — see EmailMessage's `includesInvoice` flag.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { orderId } });
  if (!invoice) {
    return NextResponse.json({ message: "No invoice for this order." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(invoice.pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${String(invoice.number).padStart(6, "0")}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
