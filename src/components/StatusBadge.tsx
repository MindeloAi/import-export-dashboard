// Maps every status value used across the app to a Tailwind colour pairing.
const STYLES: Record<string, string> = {
  // Deal statuses
  Lead: "bg-slate-100 text-slate-700 ring-slate-200",
  Negotiating: "bg-amber-100 text-amber-800 ring-amber-200",
  Confirmed: "bg-blue-100 text-blue-800 ring-blue-200",
  Shipped: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  Delivered: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Closed: "bg-emerald-600/10 text-emerald-700 ring-emerald-600/20",
  Cancelled: "bg-rose-100 text-rose-700 ring-rose-200",
  // Shipment statuses
  Pending: "bg-slate-100 text-slate-700 ring-slate-200",
  Booked: "bg-blue-100 text-blue-800 ring-blue-200",
  "In Transit": "bg-indigo-100 text-indigo-800 ring-indigo-200",
  Customs: "bg-amber-100 text-amber-800 ring-amber-200",
  // Contact type / status
  Supplier: "bg-violet-100 text-violet-800 ring-violet-200",
  Buyer: "bg-teal-100 text-teal-800 ring-teal-200",
  Both: "bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-200",
  Active: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  Inactive: "bg-slate-100 text-slate-500 ring-slate-200",
  // Payment status
  Unpaid: "bg-rose-100 text-rose-700 ring-rose-200",
  "Deposit Paid": "bg-amber-100 text-amber-800 ring-amber-200",
  Paid: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  // Container type
  "20ft": "bg-slate-100 text-slate-700 ring-slate-200",
  "40ft": "bg-blue-100 text-blue-800 ring-blue-200",
  "40HC": "bg-indigo-100 text-indigo-800 ring-indigo-200",
  Reefer: "bg-teal-100 text-teal-800 ring-teal-200",
};

export function StatusBadge({ value }: { value?: string }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const style = STYLES[value] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {value}
    </span>
  );
}
