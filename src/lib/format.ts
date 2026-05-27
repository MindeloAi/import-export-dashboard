const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole-dollar currency, e.g. $64,800 — for deal totals and KPIs. */
export function money(value: number | undefined): string {
  return currency.format(value ?? 0);
}

/** Cent-precision currency, e.g. $2.80 — for unit prices. */
export function moneyPrecise(value: number | undefined): string {
  return currencyCents.format(value ?? 0);
}

export function compactMoney(value: number | undefined): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value ?? 0);
}

export function number(value: number | undefined): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

/** ISO date string -> "12 Feb 2026". Returns "—" when empty. */
export function shortDate(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** ISO date string -> "Feb 2026" month bucket key. */
export function monthLabel(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
