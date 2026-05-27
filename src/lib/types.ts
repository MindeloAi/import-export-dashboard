// Domain types for the import/export brokerage dashboard.
// Field shapes mirror the Airtable base "Import/Export Brokerage (Demo)".

export type ContactType = "Supplier" | "Buyer" | "Both";
export type ContactStatus = "Active" | "Inactive";

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  goodsCategory?: string;
  status?: ContactStatus;
  notes?: string;
}

export type Unit = "Unit" | "Kg" | "Pallet" | "Container";

export interface Product {
  id: string;
  product: string;
  category?: string;
  unit?: Unit;
  supplier?: string;
  buyPrice?: number;
  sellPrice?: number;
  notes?: string;
}

export type DealStatus =
  | "Lead"
  | "Negotiating"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Closed"
  | "Cancelled";

export const DEAL_STATUSES: DealStatus[] = [
  "Lead",
  "Negotiating",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Closed",
  "Cancelled",
];

// Statuses that count as live, in-progress business (not won/lost).
export const ACTIVE_DEAL_STATUSES: DealStatus[] = [
  "Lead",
  "Negotiating",
  "Confirmed",
  "Shipped",
];

export interface Deal {
  id: string;
  deal: string;
  supplier?: string;
  buyer?: string;
  product?: string;
  quantity?: number;
  buyTotal?: number;
  sellTotal?: number;
  status?: DealStatus;
  dateOpened?: string;
  expectedClose?: string;
  notes?: string;
}

export type ShipmentStatus =
  | "Pending"
  | "Booked"
  | "In Transit"
  | "Customs"
  | "Delivered";

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "Pending",
  "Booked",
  "In Transit",
  "Customs",
  "Delivered",
];

export interface Shipment {
  id: string;
  reference: string;
  deal?: string;
  status?: ShipmentStatus;
  originPort?: string;
  destinationPort?: string;
  carrier?: string;
  containerNo?: string;
  incoterm?: string;
  etd?: string;
  eta?: string;
  notes?: string;
}

/** Margin (broker's cut) for a deal: what we sell for minus what we pay. */
export function dealMargin(deal: Deal): number {
  return (deal.sellTotal ?? 0) - (deal.buyTotal ?? 0);
}

/** Margin percentage relative to the sell price. */
export function dealMarginPct(deal: Deal): number {
  if (!deal.sellTotal) return 0;
  return (dealMargin(deal) / deal.sellTotal) * 100;
}
