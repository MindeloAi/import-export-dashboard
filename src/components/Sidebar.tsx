"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Overview", icon: "▦" },
  { href: "/deals", label: "Deals", icon: "◷" },
  { href: "/contacts", label: "Contacts", icon: "☎" },
  { href: "/products", label: "Products", icon: "❏" },
  { href: "/shipments", label: "Shipments", icon: "⚓" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
          ⇄
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">TradeBridge</p>
          <p className="text-xs text-slate-400">Import / Export Desk</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-2">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="w-4 text-center text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-5 py-4 text-xs text-slate-400">
        Demo data · Airtable
      </div>
    </aside>
  );
}
