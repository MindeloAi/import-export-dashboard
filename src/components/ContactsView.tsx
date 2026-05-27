"use client";

import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Contact } from "@/lib/types";

export function ContactsView({ contacts }: { contacts: Contact[] }) {
  const [type, setType] = useState<string>("All");
  const [country, setCountry] = useState<string>("All");
  const [query, setQuery] = useState("");

  const countries = useMemo(
    () =>
      [...new Set(contacts.map((c) => c.country).filter(Boolean))].sort() as string[],
    [contacts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (type !== "All" && c.type !== type) return false;
      if (country !== "All" && c.country !== country) return false;
      if (!q) return true;
      return [c.name, c.contactPerson, c.goodsCategory, c.city]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [contacts, type, country, query]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search partners…"
          className="w-56 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
        >
          <option value="All">All types</option>
          <option value="Supplier">Supplier</option>
          <option value="Buyer">Buyer</option>
          <option value="Both">Both</option>
        </select>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
        >
          <option value="All">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-slate-400">
          {filtered.length} of {contacts.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Type</th>
              <th>Contact</th>
              <th>Country</th>
              <th>City</th>
              <th>Goods</th>
              <th>Terms</th>
              <th>Status</th>
              <th>Email</th>
              <th>Website</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="font-medium text-slate-900">{c.name}</td>
                <td>
                  <StatusBadge value={c.type} />
                </td>
                <td>{c.contactPerson ?? "—"}</td>
                <td>{c.country ?? "—"}</td>
                <td>{c.city ?? "—"}</td>
                <td>{c.goodsCategory ?? "—"}</td>
                <td className="text-slate-500">{c.paymentTerms ?? "—"}</td>
                <td>
                  <StatusBadge value={c.status} />
                </td>
                <td>
                  {c.email ? (
                    <a
                      href={`mailto:${c.email}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {c.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {c.website ? (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {c.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-slate-400">
                  No contacts match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
