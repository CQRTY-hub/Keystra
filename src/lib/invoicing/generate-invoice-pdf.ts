import PDFDocument from "pdfkit";
import contactEn from "@/i18n/legal/contact.en";
import { formatPriceCents } from "@/lib/currency";

export interface InvoiceLine {
  title: string;
  quantity: number;
  unitPriceCents: number;
}

export interface InvoicePdfInput {
  invoiceNumber: number;
  issuedAt: Date;
  orderId: string;
  customerName: string;
  customerAddress: string;
  customerCountry: string;
  customerEmail: string;
  lines: InvoiceLine[];
  totalCents: number;
}

/**
 * PLAN.md, Phase 3.6: "All Belgian mandatory invoice fields: my details
 * and ondernemingsnummer/VAT number, the customer's details, invoice
 * date, sequential number, description, net amount, VAT rate and amount
 * per rate, total."
 *
 * VAT: Keystra currently applies the small-business exemption scheme
 * (art. 56bis Btw-Wetboek) — see terms.en/nl.ts's "Prices and VAT"
 * paragraph and Design/juridische-vragen.md, point 3. That question is
 * with the accountant and still open. `VAT_EXEMPT` below is the one
 * place this invoice's VAT treatment is decided — flip it (and the
 * exemption line's wording) once that answer comes back, rather than
 * hunting through the layout code for every place VAT is mentioned.
 *
 * pdfkit, not a headless-browser-based renderer (e.g. Puppeteer): no
 * Chromium to bundle or run, which matters once this runs on Vercel's
 * serverless functions (Task 3) — pdfkit is pure Node/JS.
 */
const VAT_EXEMPT = true;

export function generateInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const invoiceNumberDisplay = `INV-${String(input.invoiceNumber).padStart(6, "0")}`;

    // --- Header: trader identity (contact.en.ts is the single source of
    // truth for these — see terms.en.ts / contact/page.tsx for the same
    // fields used elsewhere). ---
    doc.fontSize(20).text("Keystra", { continued: false });
    doc.fontSize(10).fillColor("#555555");
    doc.text(`${contactEn.traderName} — ${contactEn.legalForm}`);
    doc.text(contactEn.address);
    doc.text(`Company number: ${contactEn.companyNumber}`);
    doc.text(
      VAT_EXEMPT
        ? "VAT: small-business exemption scheme (art. 56bis Belgian VAT Code) — no VAT charged"
        : `VAT number: ${contactEn.vatNumber}`
    );
    doc.text(`Email: ${contactEn.email}`);
    doc.fillColor("#000000");
    doc.moveDown(1.5);

    // --- Invoice metadata ---
    doc.fontSize(14).text(`Invoice ${invoiceNumberDisplay}`);
    doc.fontSize(10).fillColor("#555555");
    doc.text(`Date: ${input.issuedAt.toISOString().slice(0, 10)}`);
    doc.text(`Order reference: ${input.orderId}`);
    doc.fillColor("#000000");
    doc.moveDown(1.5);

    // --- Customer ---
    doc.fontSize(11).text("Billed to");
    doc.fontSize(10).fillColor("#555555");
    doc.text(input.customerName);
    doc.text(input.customerAddress);
    doc.text(input.customerCountry);
    doc.text(input.customerEmail);
    doc.fillColor("#000000");
    doc.moveDown(1.5);

    // --- Line items ---
    // Fixed, non-overlapping column boxes (x, width) — every piece of
    // text is drawn with an explicit `width` so pdfkit wraps inside its
    // own column instead of bleeding into the next one. That's what
    // actually went wrong in an earlier version of this layout: a label
    // ("VAT (exempt, art. 56bis)") wider than the gap before the amount
    // column ran straight into the number next to it.
    const pageRight = doc.page.width - doc.page.margins.right;
    const colDescription = { x: 50, width: 220 };
    const colQty = { x: 280, width: 40 };
    const colUnitPrice = { x: 330, width: 90 };
    const colAmount = { x: pageRight - 90, width: 90 };
    const tableTop = doc.y;

    doc.fontSize(10);
    doc.text("Description", colDescription.x, tableTop, { width: colDescription.width });
    doc.text("Qty", colQty.x, tableTop, { width: colQty.width });
    doc.text("Unit price", colUnitPrice.x, tableTop, { width: colUnitPrice.width, align: "right" });
    doc.text("Amount", colAmount.x, tableTop, { width: colAmount.width, align: "right" });
    doc
      .moveTo(colDescription.x, tableTop + 15)
      .lineTo(pageRight, tableTop + 15)
      .strokeColor("#cccccc")
      .stroke();

    let rowY = tableTop + 22;
    for (const line of input.lines) {
      const rowHeight = Math.max(
        doc.heightOfString(line.title, { width: colDescription.width }),
        12
      );
      doc.text(line.title, colDescription.x, rowY, { width: colDescription.width });
      doc.text(String(line.quantity), colQty.x, rowY, { width: colQty.width });
      doc.text(formatPriceCents(line.unitPriceCents), colUnitPrice.x, rowY, {
        width: colUnitPrice.width,
        align: "right",
      });
      doc.text(formatPriceCents(line.unitPriceCents * line.quantity), colAmount.x, rowY, {
        width: colAmount.width,
        align: "right",
      });
      rowY += rowHeight + 10;
    }

    doc
      .moveTo(colDescription.x, rowY + 5)
      .lineTo(pageRight, rowY + 5)
      .strokeColor("#cccccc")
      .stroke();
    rowY += 15;

    // --- Totals / VAT --- label column is wide on purpose: "VAT
    // (exempt, art. 56bis)" is the longest string that has to fit here.
    const colTotalsLabel = { x: 260, width: 160 };

    doc.fontSize(10);
    doc.text("Net amount", colTotalsLabel.x, rowY, { width: colTotalsLabel.width, align: "right" });
    doc.text(formatPriceCents(input.totalCents), colAmount.x, rowY, {
      width: colAmount.width,
      align: "right",
    });
    rowY += 16;

    doc.text(VAT_EXEMPT ? "VAT (exempt, art. 56bis)" : "VAT (0%)", colTotalsLabel.x, rowY, {
      width: colTotalsLabel.width,
      align: "right",
    });
    doc.text(formatPriceCents(0), colAmount.x, rowY, { width: colAmount.width, align: "right" });
    rowY += 16;

    doc.fontSize(11);
    doc.text("Total", colTotalsLabel.x, rowY, { width: colTotalsLabel.width, align: "right" });
    doc.text(formatPriceCents(input.totalCents), colAmount.x, rowY, {
      width: colAmount.width,
      align: "right",
    });
    rowY += 30;

    // --- Footer ---
    doc
      .fontSize(9)
      .fillColor("#888888")
      .text(
        "This invoice is issued for a digital licence key delivered electronically — no shipping address applies.",
        colDescription.x,
        rowY,
        { width: pageRight - colDescription.x }
      );

    doc.end();
  });
}
