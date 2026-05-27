"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { money, shortDate } from "@/lib/format";
import {
  DEAL_STATUSES,
  dealMargin,
  dealMarginPct,
  type Deal,
} from "@/lib/types";

export function DealsView({ deals }: { deals: Deal[] }) {
  const [status, setStatus] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      if (status !== "All" && d.status !== status) return false;
      if (!q) return true;
      return [d.deal, d.supplier, d.buyer, d.product, d.originCountry, d.destinationCountry]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [deals, status, query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search deals, partners, products…"
          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-64"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
        >
          <option value="All">All statuses</option>
          {DEAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-slate-400">
          {filtered.length} of {deals.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Supplier</th>
              <th>Buyer</th>
              <th>Route</th>
              <th>Product</th>
              <th className="num">Qty</th>
              <th className="num">Buy</th>
              <th className="num">Sell</th>
              <th className="num">Margin</th>
              <th className="num">Comm %</th>
              <th>Incoterm</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Opened</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td className="font-medium text-slate-900">{d.deal}</td>
                <td>{d.supplier ?? "—"}</td>
                <td>{d.buyer ?? "—"}</td>
                <td className="whitespace-nowrap text-slate-500">
                  {d.originCountry ?? "?"}{" "}
                  <span className="text-slate-400">→</span>{" "}
                  {d.destinationCountry ?? "?"}
                </td>
                <td>{d.product ?? "—"}</td>
                <td className="num">{d.quantity?.toLocaleString() ?? "—"}</td>
                <td className="num">{money(d.buyTotal)}</td>
                <td className="num">{money(d.sellTotal)}</td>
                <td className="num font-medium text-emerald-600">
                  {money(dealMargin(d))}
                </td>
                <td className="num text-slate-500">
                  {(d.commissionRate ?? dealMarginPct(d)).toFixed(1)}%
                </td>
                <td className="text-slate-500">{d.incoterm ?? "—"}</td>
                <td>
                  <StatusBadge value={d.paymentStatus} />
                </td>
                <td>
                  <StatusBadge value={d.status} />
                </td>
                <td>{shortDate(d.dateOpened)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={14} className="py-10 text-center text-slate-400">
                  No deals match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
