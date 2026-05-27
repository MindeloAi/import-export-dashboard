"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { shortDate } from "@/lib/format";
import { SHIPMENT_STATUSES, type Shipment } from "@/lib/types";

export function ShipmentsView({ shipments }: { shipments: Shipment[] }) {
  const [status, setStatus] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shipments.filter((s) => {
      if (status !== "All" && s.status !== status) return false;
      if (!q) return true;
      return [s.reference, s.deal, s.originPort, s.destinationPort, s.carrier]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [shipments, status, query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shipments, ports, carriers…"
          className="w-64 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
        >
          <option value="All">All statuses</option>
          {SHIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-slate-400">
          {filtered.length} of {shipments.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Deal</th>
              <th>Route</th>
              <th>Carrier</th>
              <th>Container</th>
              <th>Incoterm</th>
              <th>Status</th>
              <th>ETD</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-slate-900">{s.reference}</td>
                <td>{s.deal ?? "—"}</td>
                <td className="whitespace-nowrap">
                  {s.originPort ?? "?"}{" "}
                  <span className="text-slate-400">→</span>{" "}
                  {s.destinationPort ?? "?"}
                </td>
                <td>{s.carrier ?? "—"}</td>
                <td className="font-mono text-xs text-slate-500">
                  {s.containerNo ?? "—"}
                </td>
                <td className="text-slate-500">{s.incoterm ?? "—"}</td>
                <td>
                  <StatusBadge value={s.status} />
                </td>
                <td>{shortDate(s.etd)}</td>
                <td>{shortDate(s.eta)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  No shipments match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
