"use client";

import { useEffect, useState } from "react";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import {
  applyDynamicDefaults,
  computeTotals,
  defaultInvoice,
  generateInvoiceNumber,
  invoiceDate,
  invoiceMoney,
  lineAmount,
  type InvoiceData,
  type LineItem,
  type Party,
} from "@/lib/invoice";

const inputCls =
  "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const labelCls = "mb-1 block text-xs font-medium text-slate-500";

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </label>
  );
}

export function InvoiceGenerator() {
  const [data, setData] = useState<InvoiceData>(defaultInvoice);

  // Fill the invoice number + dates on the client only, so the static
  // prerender and first client render match (no hydration mismatch).
  useEffect(() => {
    setData((d) => applyDynamicDefaults(d));
  }, []);

  function set<K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setParty(party: "from" | "billTo", key: keyof Party, value: string) {
    setData((d) => ({ ...d, [party]: { ...d[party], [key]: value } }));
  }

  function setItem(index: number, key: keyof LineItem, value: string) {
    setData((d) => {
      const items = d.items.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: key === "description" ? value : Number(value) || 0,
            }
          : item,
      );
      return { ...d, items };
    });
  }

  function addItem() {
    setData((d) => ({
      ...d,
      items: [...d.items, { description: "", quantity: 1, unitPrice: 0 }],
    }));
  }

  function removeItem(index: number) {
    setData((d) => ({ ...d, items: d.items.filter((_, i) => i !== index) }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* ---- Form ---- */}
      <div className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Invoice details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex items-end gap-2">
              <div className="flex-1">
                <Field
                  label="Invoice number"
                  value={data.invoiceNumber}
                  onChange={(v) => set("invoiceNumber", v)}
                />
              </div>
              <button
                type="button"
                onClick={() => set("invoiceNumber", generateInvoiceNumber())}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50"
                title="Generate a new number"
              >
                ↻
              </button>
            </div>
            <Field
              label="Invoice date"
              type="date"
              value={data.invoiceDate}
              onChange={(v) => set("invoiceDate", v)}
            />
            <Field
              label="Due date"
              type="date"
              value={data.dueDate}
              onChange={(v) => set("dueDate", v)}
            />
            <Field
              label="Business ID"
              value={data.businessId}
              onChange={(v) => set("businessId", v)}
            />
            <Field
              label="Business #"
              value={data.businessNo}
              onChange={(v) => set("businessNo", v)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Bill to</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field
                label="Name"
                value={data.billTo.name}
                onChange={(v) => setParty("billTo", "name", v)}
              />
            </div>
            <Field
              label="Address line 1"
              value={data.billTo.line1}
              onChange={(v) => setParty("billTo", "line1", v)}
            />
            <Field
              label="Address line 2"
              value={data.billTo.line2}
              onChange={(v) => setParty("billTo", "line2", v)}
            />
            <Field
              label="Email"
              value={data.billTo.email}
              onChange={(v) => setParty("billTo", "email", v)}
            />
            <Field
              label="Phone"
              value={data.billTo.phone}
              onChange={(v) => setParty("billTo", "phone", v)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Line items</h2>
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              + Add item
            </button>
          </div>
          <div className="space-y-3">
            {data.items.map((item, i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    value={item.description}
                    onChange={(e) => setItem(i, "description", e.target.value)}
                    placeholder="Description"
                    className={`${inputCls} bg-white`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    aria-label="Remove item"
                    className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className={labelCls}>Qty</span>
                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => setItem(i, "quantity", e.target.value)}
                      className={`${inputCls} bg-white`}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Unit price</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => setItem(i, "unitPrice", e.target.value)}
                      className={`${inputCls} bg-white`}
                    />
                  </label>
                  <div>
                    <span className={labelCls}>Amount</span>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900">
                      {invoiceMoney(lineAmount(item))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {data.items.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-400">
                No line items. Add one to get started.
              </p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field
              label="VAT rate (%)"
              type="number"
              value={data.vatRate}
              onChange={(v) => set("vatRate", Number(v) || 0)}
            />
            <Field
              label="Payment terms"
              value={data.paymentTerms}
              onChange={(v) => set("paymentTerms", v)}
            />
          </div>
          <label className="mt-3 block">
            <span className={labelCls}>Notes</span>
            <textarea
              value={data.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              className={inputCls}
            />
          </label>
        </section>
      </div>

      {/* ---- Live preview ---- */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <InvoicePreview data={data} />
        <button
          type="button"
          onClick={() => downloadInvoicePdf(data)}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          ⬇ Download PDF
        </button>
      </div>
    </div>
  );
}

function InvoicePreview({ data }: { data: InvoiceData }) {
  const totals = computeTotals(data);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-indigo-600">{data.from.name}</p>
            <p className="mt-1 text-xs text-slate-500">{data.from.line1}</p>
            <p className="text-xs text-slate-500">{data.from.line2}</p>
            <p className="text-xs text-slate-500">
              {data.from.phone} · {data.from.email}
            </p>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">INVOICE</h2>
        </div>

        {/* Meta */}
        <div className="mt-6 flex flex-wrap justify-between gap-4 border-t border-slate-100 pt-4 text-xs">
          <div>
            <p className="font-medium uppercase tracking-wide text-slate-400">Bill To</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{data.billTo.name}</p>
            <p className="text-slate-500">{data.billTo.line1}</p>
            <p className="text-slate-500">{data.billTo.line2}</p>
            <p className="text-slate-500">
              {data.billTo.phone} · {data.billTo.email}
            </p>
          </div>
          <div className="text-right text-slate-600">
            <p>
              <span className="text-slate-400">Invoice No: </span>
              {data.invoiceNumber}
            </p>
            <p>
              <span className="text-slate-400">Date: </span>
              {invoiceDate(data.invoiceDate)}
            </p>
            <p>
              <span className="text-slate-400">Due: </span>
              {invoiceDate(data.dueDate)}
            </p>
            <p className="mt-1 text-slate-400">
              ID {data.businessId} · {data.businessNo}
            </p>
          </div>
        </div>

        {/* Items */}
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="bg-indigo-600 text-left text-xs text-white">
              <th className="rounded-l-md px-3 py-2 font-semibold">Description</th>
              <th className="px-3 py-2 text-right font-semibold">Qty</th>
              <th className="px-3 py-2 text-right font-semibold">Unit Price</th>
              <th className="rounded-r-md px-3 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={i} className={i % 2 ? "bg-slate-50" : ""}>
                <td className="px-3 py-2 text-slate-900">{item.description || "—"}</td>
                <td className="px-3 py-2 text-right text-slate-600">{item.quantity || 0}</td>
                <td className="px-3 py-2 text-right text-slate-600">
                  {invoiceMoney(item.unitPrice)}
                </td>
                <td className="px-3 py-2 text-right font-medium text-slate-900">
                  {invoiceMoney(lineAmount(item))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="text-slate-900">{invoiceMoney(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>VAT ({data.vatRate || 0}%)</span>
              <span className="text-slate-900">{invoiceMoney(totals.vat)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-indigo-600">
              <span>Total Due</span>
              <span>{invoiceMoney(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Payment Terms: {data.paymentTerms}</p>
          {data.notes && <p className="mt-1">{data.notes}</p>}
        </div>
      </div>
    </div>
  );
}
