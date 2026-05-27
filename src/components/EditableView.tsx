"use client";

import { useState } from "react";
import { EditableGrid } from "@/components/EditableGrid";
import { ENTITY_SCHEMAS, type EntityKey } from "@/lib/editable-schema";
import type { Contact, Deal, Product, Shipment } from "@/lib/types";

type RecordLike = { id: string } & Record<string, unknown>;

const TABS: EntityKey[] = ["deals", "contacts", "products", "shipments"];

export function EditableView({
  deals,
  contacts,
  products,
  shipments,
}: {
  deals: Deal[];
  contacts: Contact[];
  products: Product[];
  shipments: Shipment[];
}) {
  const [active, setActive] = useState<EntityKey>("deals");

  // The grid only reads `id` and schema-defined keys, so the domain records
  // are structurally compatible; cast away the missing index signature.
  const records: Record<EntityKey, RecordLike[]> = {
    deals: deals as unknown as RecordLike[],
    contacts: contacts as unknown as RecordLike[],
    products: products as unknown as RecordLike[],
    shipments: shipments as unknown as RecordLike[],
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {TABS.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {ENTITY_SCHEMAS[tab].label}
              <span className="ml-1.5 text-xs text-slate-400">
                {records[tab].length}
              </span>
            </button>
          );
        })}
      </div>

      <EditableGrid
        key={active}
        entity={active}
        initialRecords={records[active]}
      />
    </div>
  );
}
