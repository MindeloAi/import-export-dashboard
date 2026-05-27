// Invoice domain model for the standalone invoice generator.
// Everything here is pure so the form, live preview, and PDF builder all
// derive from the same data shape.

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Party {
  name: string;
  line1: string;
  line2: string;
  email: string;
  phone: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string; // ISO yyyy-mm-dd
  dueDate: string; // ISO yyyy-mm-dd
  from: Party;
  billTo: Party;
  businessId: string;
  businessNo: string;
  items: LineItem[];
  vatRate: number; // percentage, e.g. 12.5
  paymentTerms: string;
  notes: string;
}

/** Sequential-style invoice number: INV-YYYYMMDD-XXXX (XXXX random 1000–9999). */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${stamp}-${suffix}`;
}

/** ISO date today, optionally offset by a number of days. */
export function isoDate(offsetDays = 0, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function lineAmount(item: LineItem): number {
  return (item.quantity || 0) * (item.unitPrice || 0);
}

export interface InvoiceTotals {
  subtotal: number;
  vat: number;
  total: number;
}

export function computeTotals(data: InvoiceData): InvoiceTotals {
  const subtotal = data.items.reduce((sum, item) => sum + lineAmount(item), 0);
  const vat = subtotal * ((data.vatRate || 0) / 100);
  return { subtotal, vat, total: subtotal + vat };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Cent-precision USD, e.g. "$12,480.00", used across the invoice + PDF. */
export function invoiceMoney(value: number): string {
  return usd.format(value || 0);
}

/** ISO date string -> "27 May 2026". */
export function invoiceDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * A fully populated dummy invoice billed to Robert Conyers, issued by the
 * TradeBridge brokerage. Used as the generator's starting point.
 *
 * The number and dates are left blank here so server prerender and client
 * hydration produce identical markup; the generator fills them on mount via
 * applyDynamicDefaults() (see InvoiceGenerator).
 */
export function defaultInvoice(): InvoiceData {
  return {
    invoiceNumber: "",
    invoiceDate: "",
    dueDate: "",
    from: {
      name: "TradeBridge Import/Export Desk",
      line1: "12 Harbour View Road, Port of Spain",
      line2: "Trinidad & Tobago",
      email: "billing@tradebridge.example",
      phone: "868-555-0142",
    },
    billTo: {
      name: "Robert Conyers",
      line1: "48 Maraval Avenue, Suite 5",
      line2: "Port of Spain, Trinidad & Tobago",
      email: "robert.conyers@example.com",
      phone: "868-555-0199",
    },
    businessId: "6516185",
    businessNo: "B2023090500037",
    items: [
      { description: "40ft container — Ceramic floor tiles (CIF)", quantity: 2, unitPrice: 8400 },
      { description: "Customs brokerage & clearance fee", quantity: 1, unitPrice: 1250 },
      { description: "Inland haulage — Port to warehouse", quantity: 3, unitPrice: 480 },
      { description: "Cargo insurance (1.2% of declared value)", quantity: 1, unitPrice: 612 },
    ],
    vatRate: 12.5,
    paymentTerms: "Net 14",
    notes: "Payment due within 14 days of invoice date. Thank you for your business.",
  };
}

/**
 * Client-only number + dates, applied after mount so they don't get baked
 * into the static prerender (which would cause a hydration mismatch).
 */
export function applyDynamicDefaults(data: InvoiceData): InvoiceData {
  return {
    ...data,
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: isoDate(0),
    dueDate: isoDate(14),
  };
}
