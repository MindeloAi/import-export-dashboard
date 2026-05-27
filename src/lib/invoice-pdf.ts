import { jsPDF } from "jspdf";
import {
  computeTotals,
  invoiceDate,
  invoiceMoney,
  lineAmount,
  type InvoiceData,
} from "./invoice";

// Brand color (indigo-600) used for the dashboard, drawn here as RGB since
// jsPDF can't parse the oklch() values Tailwind v4 emits.
const INDIGO: [number, number, number] = [79, 70, 229];
const SLATE_900: [number, number, number] = [15, 23, 42];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_200: [number, number, number] = [226, 232, 240];

const PAGE_W = 210; // A4 mm
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;

/** Build the invoice PDF and trigger a browser download. */
export function downloadInvoicePdf(data: InvoiceData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const totals = computeTotals(data);
  let y = MARGIN;

  // Header band: issuer name + INVOICE label
  doc.setTextColor(...INDIGO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(data.from.name, MARGIN, y + 4);

  doc.setTextColor(...SLATE_900);
  doc.setFontSize(22);
  doc.text("INVOICE", PAGE_W - MARGIN, y + 4, { align: "right" });
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_500);
  doc.text(data.from.line1, MARGIN, y);
  doc.text(data.from.line2, MARGIN, y + 4);
  doc.text(`${data.from.phone}  ·  ${data.from.email}`, MARGIN, y + 8);

  // Invoice meta (right aligned)
  const metaX = PAGE_W - MARGIN;
  doc.text(`Invoice No:  ${data.invoiceNumber}`, metaX, y, { align: "right" });
  doc.text(`Invoice Date:  ${invoiceDate(data.invoiceDate)}`, metaX, y + 4, { align: "right" });
  doc.text(`Due Date:  ${invoiceDate(data.dueDate)}`, metaX, y + 8, { align: "right" });
  doc.text(`Business ID:  ${data.businessId}  ·  ${data.businessNo}`, metaX, y + 12, {
    align: "right",
  });
  y += 20;

  // Divider
  doc.setDrawColor(...SLATE_200);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  // Bill To
  doc.setTextColor(...SLATE_500);
  doc.setFontSize(8);
  doc.text("BILL TO", MARGIN, y);
  y += 5;
  doc.setTextColor(...SLATE_900);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(data.billTo.name, MARGIN, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_500);
  doc.setFontSize(9);
  doc.text(data.billTo.line1, MARGIN, y);
  doc.text(data.billTo.line2, MARGIN, y + 4);
  doc.text(`${data.billTo.phone}  ·  ${data.billTo.email}`, MARGIN, y + 8);
  y += 16;

  // Line items table header
  const colQtyX = PAGE_W - MARGIN - 70;
  const colPriceX = PAGE_W - MARGIN - 38;
  const colAmtX = PAGE_W - MARGIN;

  doc.setFillColor(...INDIGO);
  doc.rect(MARGIN, y, CONTENT_W, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Description", MARGIN + 2, y + 5.5);
  doc.text("Qty", colQtyX, y + 5.5, { align: "right" });
  doc.text("Unit Price", colPriceX, y + 5.5, { align: "right" });
  doc.text("Amount", colAmtX - 2, y + 5.5, { align: "right" });
  y += 8;

  // Rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_900);
  data.items.forEach((item, i) => {
    const rowH = 8;
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(MARGIN, y, CONTENT_W, rowH, "F");
    }
    const desc = doc.splitTextToSize(item.description || "—", colQtyX - MARGIN - 6);
    doc.text(desc[0], MARGIN + 2, y + 5.5);
    doc.text(String(item.quantity || 0), colQtyX, y + 5.5, { align: "right" });
    doc.text(invoiceMoney(item.unitPrice), colPriceX, y + 5.5, { align: "right" });
    doc.text(invoiceMoney(lineAmount(item)), colAmtX - 2, y + 5.5, { align: "right" });
    y += rowH;
  });

  // Totals
  y += 4;
  doc.setDrawColor(...SLATE_200);
  doc.line(colQtyX - 6, y, PAGE_W - MARGIN, y);
  y += 6;

  const labelX = colPriceX;
  const valueX = colAmtX - 2;
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_500);
  doc.text("Subtotal", labelX, y, { align: "right" });
  doc.setTextColor(...SLATE_900);
  doc.text(invoiceMoney(totals.subtotal), valueX, y, { align: "right" });
  y += 6;
  doc.setTextColor(...SLATE_500);
  doc.text(`VAT (${data.vatRate || 0}%)`, labelX, y, { align: "right" });
  doc.setTextColor(...SLATE_900);
  doc.text(invoiceMoney(totals.vat), valueX, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INDIGO);
  doc.text("Total Due", labelX, y, { align: "right" });
  doc.text(invoiceMoney(totals.total), valueX, y, { align: "right" });
  y += 16;

  // Footer: payment terms + notes
  doc.setDrawColor(...SLATE_200);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_900);
  doc.text(`Payment Terms: ${data.paymentTerms}`, MARGIN, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_500);
  const notes = doc.splitTextToSize(data.notes || "", CONTENT_W);
  doc.text(notes, MARGIN, y);

  const safeName = data.invoiceNumber.replace(/[^A-Za-z0-9-]/g, "") || "invoice";
  doc.save(`${safeName}.pdf`);
}
