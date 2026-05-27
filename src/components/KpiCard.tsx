export function KpiCard({
  label,
  value,
  sub,
  accent = "indigo",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "indigo" | "emerald" | "amber" | "teal" | "rose";
}) {
  const accents: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    teal: "text-teal-600",
    rose: "text-rose-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold tracking-tight ${accents[accent]}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
