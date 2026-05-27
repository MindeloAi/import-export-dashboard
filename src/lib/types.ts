// Domain types for the import/export brokerage dashboard.
// Field shapes mirror the Airtable base "Import/Export Brokerage (Demo)".

export type ContactType = "Supplier" | "Buyer" | "Both";
export type ContactStatus = "Active" | "Inactive";

/** Currencies used across deals and partner terms. */
export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Standard payment terms a trading partner might agree to. */
export const PAYMENT_TERMS = ["Net 15", "Net 30", "Net 60", "CIA", "LC"] as const;
export type PaymentTerms = (typeof PAYMENT_TERMS)[number];

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  website?: string;
  taxId?: string;
  currency?: Currency;
  paymentTerms?: PaymentTerms;
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
  hsCode?: string;
  countryOfOrigin?: string;
  weightKg?: number;
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

/** Where a deal sits on getting paid. */
export const PAYMENT_STATUSES = ["Unpaid", "Deposit Paid", "Paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Incoterms that set who pays freight/insurance and where risk transfers. */
export const INCOTERMS = ["EXW", "FOB", "CIF", "DDP"] as const;
export type Incoterm = (typeof INCOTERMS)[number];

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
  originCountry?: string;
  destinationCountry?: string;
  commissionRate?: number;
  incoterm?: Incoterm;
  paymentStatus?: PaymentStatus;
  currency?: Currency;
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

/** Common ocean-freight container types. */
export const CONTAINER_TYPES = ["20ft", "40ft", "40HC", "Reefer"] as const;
export type ContainerType = (typeof CONTAINER_TYPES)[number];

export interface Shipment {
  id: string;
  reference: string;
  deal?: string;
  status?: ShipmentStatus;
  originPort?: string;
  destinationPort?: string;
  originCountry?: string;
  destinationCountry?: string;
  carrier?: string;
  vessel?: string;
  containerNo?: string;
  billOfLading?: string;
  grossWeightKg?: number;
  containerCount?: number;
  containerType?: ContainerType;
  freightCost?: number;
  incoterm?: Incoterm;
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
