// Field metadata for the inline-editable grid (/editable).
//
// This module is the SINGLE source of truth that drives both:
//   1. how each column renders (which input + which select options), and
//   2. how a camelCase record maps back to Airtable's exact field names.
//
// Keep the field lists in step with the read mappings in lib/airtable.ts and
// the schema in scripts/seed-airtable.mjs — same keys, same Airtable names.

import {
  CONTAINER_TYPES,
  CURRENCIES,
  DEAL_STATUSES,
  INCOTERMS,
  PAYMENT_STATUSES,
  PAYMENT_TERMS,
  SHIPMENT_STATUSES,
} from "./types";

export type EntityKey = "deals" | "contacts" | "products" | "shipments";

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "date"
  | "email"
  | "url"
  | "phone"
  | "multiline";

export interface FieldDescriptor {
  /** camelCase key on the domain record (e.g. "commissionRate"). */
  key: string;
  /** Column header label. */
  label: string;
  /** Exact Airtable field name (e.g. "Commission Rate"). */
  airtableField: string;
  type: FieldType;
  /** Required for type === "select". */
  options?: readonly string[];
  /** The entity's primary field — a new row can't be saved until it's set. */
  required?: boolean;
}

export interface EntitySchema {
  /** Tab label (plural). */
  label: string;
  /** Used in UI copy (e.g. "Add deal"). */
  singular: string;
  /** Matches a key of TABLES in lib/airtable.ts. */
  tableKey: EntityKey;
  fields: FieldDescriptor[];
}

// Select option lists that have no exported array in types.ts.
const CONTACT_TYPES = ["Supplier", "Buyer", "Both"] as const;
const CONTACT_STATUSES = ["Active", "Inactive"] as const;
const UNITS = ["Unit", "Kg", "Pallet", "Container"] as const;

export const ENTITY_SCHEMAS: Record<EntityKey, EntitySchema> = {
  deals: {
    label: "Deals",
    singular: "deal",
    tableKey: "deals",
    fields: [
      { key: "deal", label: "Deal", airtableField: "Deal", type: "text", required: true },
      { key: "supplier", label: "Supplier", airtableField: "Supplier", type: "text" },
      { key: "buyer", label: "Buyer", airtableField: "Buyer", type: "text" },
      { key: "product", label: "Product", airtableField: "Product", type: "text" },
      { key: "quantity", label: "Quantity", airtableField: "Quantity", type: "number" },
      { key: "buyTotal", label: "Buy Total", airtableField: "Buy Total", type: "number" },
      { key: "sellTotal", label: "Sell Total", airtableField: "Sell Total", type: "number" },
      { key: "status", label: "Status", airtableField: "Status", type: "select", options: DEAL_STATUSES },
      { key: "originCountry", label: "Origin Country", airtableField: "Origin Country", type: "text" },
      { key: "destinationCountry", label: "Destination Country", airtableField: "Destination Country", type: "text" },
      { key: "commissionRate", label: "Commission Rate", airtableField: "Commission Rate", type: "number" },
      { key: "incoterm", label: "Incoterm", airtableField: "Incoterm", type: "select", options: INCOTERMS },
      { key: "paymentStatus", label: "Payment Status", airtableField: "Payment Status", type: "select", options: PAYMENT_STATUSES },
      { key: "currency", label: "Currency", airtableField: "Currency", type: "select", options: CURRENCIES },
      { key: "dateOpened", label: "Date Opened", airtableField: "Date Opened", type: "date" },
      { key: "expectedClose", label: "Expected Close", airtableField: "Expected Close", type: "date" },
      { key: "notes", label: "Notes", airtableField: "Notes", type: "multiline" },
    ],
  },
  contacts: {
    label: "Contacts",
    singular: "contact",
    tableKey: "contacts",
    fields: [
      { key: "name", label: "Name", airtableField: "Name", type: "text", required: true },
      { key: "type", label: "Type", airtableField: "Type", type: "select", options: CONTACT_TYPES },
      { key: "contactPerson", label: "Contact Person", airtableField: "Contact Person", type: "text" },
      { key: "email", label: "Email", airtableField: "Email", type: "email" },
      { key: "phone", label: "Phone", airtableField: "Phone", type: "phone" },
      { key: "country", label: "Country", airtableField: "Country", type: "text" },
      { key: "city", label: "City", airtableField: "City", type: "text" },
      { key: "address", label: "Address", airtableField: "Address", type: "text" },
      { key: "website", label: "Website", airtableField: "Website", type: "url" },
      { key: "taxId", label: "Tax ID", airtableField: "Tax ID", type: "text" },
      { key: "currency", label: "Currency", airtableField: "Currency", type: "select", options: CURRENCIES },
      { key: "paymentTerms", label: "Payment Terms", airtableField: "Payment Terms", type: "select", options: PAYMENT_TERMS },
      { key: "goodsCategory", label: "Goods Category", airtableField: "Goods Category", type: "text" },
      { key: "status", label: "Status", airtableField: "Status", type: "select", options: CONTACT_STATUSES },
      { key: "notes", label: "Notes", airtableField: "Notes", type: "multiline" },
    ],
  },
  products: {
    label: "Products",
    singular: "product",
    tableKey: "products",
    fields: [
      { key: "product", label: "Product", airtableField: "Product", type: "text", required: true },
      { key: "category", label: "Category", airtableField: "Category", type: "text" },
      { key: "unit", label: "Unit", airtableField: "Unit", type: "select", options: UNITS },
      { key: "supplier", label: "Supplier", airtableField: "Supplier", type: "text" },
      { key: "buyPrice", label: "Buy Price", airtableField: "Buy Price", type: "number" },
      { key: "sellPrice", label: "Sell Price", airtableField: "Sell Price", type: "number" },
      { key: "hsCode", label: "HS Code", airtableField: "HS Code", type: "text" },
      { key: "countryOfOrigin", label: "Country of Origin", airtableField: "Country of Origin", type: "text" },
      { key: "weightKg", label: "Weight (kg)", airtableField: "Weight (kg)", type: "number" },
      { key: "notes", label: "Notes", airtableField: "Notes", type: "multiline" },
    ],
  },
  shipments: {
    label: "Shipments",
    singular: "shipment",
    tableKey: "shipments",
    fields: [
      { key: "reference", label: "Reference", airtableField: "Reference", type: "text", required: true },
      { key: "deal", label: "Deal", airtableField: "Deal", type: "text" },
      { key: "status", label: "Status", airtableField: "Status", type: "select", options: SHIPMENT_STATUSES },
      { key: "originPort", label: "Origin Port", airtableField: "Origin Port", type: "text" },
      { key: "destinationPort", label: "Destination Port", airtableField: "Destination Port", type: "text" },
      { key: "originCountry", label: "Origin Country", airtableField: "Origin Country", type: "text" },
      { key: "destinationCountry", label: "Destination Country", airtableField: "Destination Country", type: "text" },
      { key: "carrier", label: "Carrier", airtableField: "Carrier", type: "text" },
      { key: "vessel", label: "Vessel", airtableField: "Vessel", type: "text" },
      { key: "containerNo", label: "Container No", airtableField: "Container No", type: "text" },
      { key: "billOfLading", label: "Bill of Lading", airtableField: "Bill of Lading", type: "text" },
      { key: "grossWeightKg", label: "Gross Weight (kg)", airtableField: "Gross Weight (kg)", type: "number" },
      { key: "containerCount", label: "Container Count", airtableField: "Container Count", type: "number" },
      { key: "containerType", label: "Container Type", airtableField: "Container Type", type: "select", options: CONTAINER_TYPES },
      { key: "freightCost", label: "Freight Cost", airtableField: "Freight Cost", type: "number" },
      { key: "incoterm", label: "Incoterm", airtableField: "Incoterm", type: "select", options: INCOTERMS },
      { key: "etd", label: "ETD", airtableField: "ETD", type: "date" },
      { key: "eta", label: "ETA", airtableField: "ETA", type: "date" },
      { key: "notes", label: "Notes", airtableField: "Notes", type: "multiline" },
    ],
  },
};

/** Number field types whose values must be coerced from string to number. */
function isNumeric(type: FieldType): boolean {
  return type === "number";
}

/**
 * Convert a record of string cell values (as held in the grid) into the
 * `fields` object Airtable expects, keyed by Airtable field name.
 *
 * Coercion rules:
 *  - empty / whitespace-only  -> null  (clears the cell in Airtable)
 *  - number                   -> Number(value); 0 preserved; NaN rejected
 *  - everything else          -> trimmed string
 *
 * Only keys present in `values` are emitted, so callers can send a partial
 * patch (just the dirty fields) for updates.
 *
 * Returns the mapped fields plus any per-key validation errors (bad numbers).
 */
export function toAirtableFields(
  entity: EntityKey,
  values: Record<string, unknown>,
): { fields: Record<string, unknown>; errors: string[] } {
  const fields: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const desc of ENTITY_SCHEMAS[entity].fields) {
    if (!(desc.key in values)) continue;

    const raw = values[desc.key];
    const text = raw == null ? "" : String(raw).trim();

    if (text === "") {
      fields[desc.airtableField] = null;
      continue;
    }

    if (isNumeric(desc.type)) {
      const n = Number(text);
      if (Number.isNaN(n)) {
        errors.push(`${desc.label} must be a number`);
        continue;
      }
      fields[desc.airtableField] = n;
      continue;
    }

    fields[desc.airtableField] = text;
  }

  return { fields, errors };
}
