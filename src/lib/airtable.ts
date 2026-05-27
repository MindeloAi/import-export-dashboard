import { cache } from "react";
import type { Contact, Deal, Product, Shipment } from "./types";

// Table IDs in the "Import/Export Brokerage (Demo)" base.
const TABLES = {
  contacts: "tblqHQPf4birbtktd",
  products: "tblOkNiDPynwtO5Hj",
  deals: "tbljjsHry9I3WIUzo",
  shipments: "tblRLFITYKf1mflgm",
} as const;

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? "appmNmeqxOSiWTPud";
const API_KEY = process.env.AIRTABLE_API_KEY;

/** True once a Personal Access Token has been supplied via env. */
export function isAirtableConfigured(): boolean {
  return Boolean(API_KEY && API_KEY.trim().length > 0);
}

type AirtableRecord = { id: string; fields: Record<string, unknown> };

/**
 * Fetch every record from a table, following Airtable's pagination.
 * Throws if the token is missing or the API responds with an error so
 * callers can surface a clear state instead of rendering empty tables.
 */
async function fetchAll(tableId: string): Promise<AirtableRecord[]> {
  if (!isAirtableConfigured()) {
    throw new Error("AIRTABLE_API_KEY is not set");
  }

  const records: AirtableRecord[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      // Re-fetch at most every 30s so edits in Airtable show up promptly.
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`Airtable ${tableId} responded ${res.status}`);
    }

    const json = (await res.json()) as {
      records: AirtableRecord[];
      offset?: string;
    };
    records.push(...json.records);
    offset = json.offset;
  } while (offset);

  return records;
}

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.length > 0 ? v : undefined;
const num = (v: unknown): number | undefined =>
  typeof v === "number" ? v : undefined;

export const getContacts = cache(async (): Promise<Contact[]> => {
  const rows = await fetchAll(TABLES.contacts);
  return rows.map((r) => ({
    id: r.id,
    name: str(r.fields["Name"]) ?? "Untitled",
    type: (str(r.fields["Type"]) as Contact["type"]) ?? "Buyer",
    contactPerson: str(r.fields["Contact Person"]),
    email: str(r.fields["Email"]),
    phone: str(r.fields["Phone"]),
    country: str(r.fields["Country"]),
    goodsCategory: str(r.fields["Goods Category"]),
    status: str(r.fields["Status"]) as Contact["status"],
    notes: str(r.fields["Notes"]),
  }));
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const rows = await fetchAll(TABLES.products);
  return rows.map((r) => ({
    id: r.id,
    product: str(r.fields["Product"]) ?? "Untitled",
    category: str(r.fields["Category"]),
    unit: str(r.fields["Unit"]) as Product["unit"],
    supplier: str(r.fields["Supplier"]),
    buyPrice: num(r.fields["Buy Price"]),
    sellPrice: num(r.fields["Sell Price"]),
    notes: str(r.fields["Notes"]),
  }));
});

export const getDeals = cache(async (): Promise<Deal[]> => {
  const rows = await fetchAll(TABLES.deals);
  return rows.map((r) => ({
    id: r.id,
    deal: str(r.fields["Deal"]) ?? "Untitled",
    supplier: str(r.fields["Supplier"]),
    buyer: str(r.fields["Buyer"]),
    product: str(r.fields["Product"]),
    quantity: num(r.fields["Quantity"]),
    buyTotal: num(r.fields["Buy Total"]),
    sellTotal: num(r.fields["Sell Total"]),
    status: str(r.fields["Status"]) as Deal["status"],
    dateOpened: str(r.fields["Date Opened"]),
    expectedClose: str(r.fields["Expected Close"]),
    notes: str(r.fields["Notes"]),
  }));
});

export const getShipments = cache(async (): Promise<Shipment[]> => {
  const rows = await fetchAll(TABLES.shipments);
  return rows.map((r) => ({
    id: r.id,
    reference: str(r.fields["Reference"]) ?? "Untitled",
    deal: str(r.fields["Deal"]),
    status: str(r.fields["Status"]) as Shipment["status"],
    originPort: str(r.fields["Origin Port"]),
    destinationPort: str(r.fields["Destination Port"]),
    carrier: str(r.fields["Carrier"]),
    containerNo: str(r.fields["Container No"]),
    incoterm: str(r.fields["Incoterm"]),
    etd: str(r.fields["ETD"]),
    eta: str(r.fields["ETA"]),
    notes: str(r.fields["Notes"]),
  }));
});
