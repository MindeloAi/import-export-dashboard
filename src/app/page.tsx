import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { SetupNotice } from "@/components/SetupNotice";
import { MarginTrendChart, PipelineChart } from "@/components/Charts";
import { StatusBadge } from "@/components/StatusBadge";
import { getContacts, getDeals, getShipments, isAirtableConfigured } from "@/lib/airtable";
import { compactMoney, money, shortDate } from "@/lib/format";
import {
  ACTIVE_DEAL_STATUSES,
  DEAL_STATUSES,
  dealMargin,
  type Deal,
} from "@/lib/types";

export default async function OverviewPage() {
  if (!isAirtableConfigured()) {
    return (
      <>
        <PageHeader title="Overview" description="Brokerage performance at a glance." />
        <SetupNotice />
      </>
    );
  }

  const [deals, contacts, shipments] = await Promise.all([
    getDeals(),
    getContacts(),
    getShipments(),
  ]);

  const isActive = (d: Deal) =>
    d.status !== undefined && ACTIVE_DEAL_STATUSES.includes(d.status);
  const isRealized = (d: Deal) =>
    d.status === "Delivered" || d.status === "Closed";

  const pipelineValue = deals
    .filter(isActive)
    .reduce((sum, d) => sum + (d.sellTotal ?? 0), 0);
  const realizedMargin = deals
    .filter(isRealized)
    .reduce((sum, d) => sum + dealMargin(d), 0);
  const activeCount = deals.filter(isActive).length;
  const suppliers = contacts.filter(
    (c) => c.type === "Supplier" || c.type === "Both",
  ).length;
  const buyers = contacts.filter(
    (c) => c.type === "Buyer" || c.type === "Both",
  ).length;
  const inTransit = shipments.filter((s) => s.status === "In Transit").length;

  // Margin by month, from realized deals, sorted chronologically.
  const monthBuckets = new Map<string, { label: string; margin: number }>();
  for (const d of deals.filter(isRealized)) {
    if (!d.dateOpened) continue;
    const date = new Date(d.dateOpened);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const bucket = monthBuckets.get(key) ?? { label, margin: 0 };
    bucket.margin += dealMargin(d);
    monthBuckets.set(key, bucket);
  }
  const marginTrend = [...monthBuckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ month: v.label, margin: v.margin }));

  // Deal value by status (excludes cancelled), in pipeline order.
  const pipelineData = DEAL_STATUSES.filter((s) => s !== "Cancelled").map(
    (status) => ({
      status,
      value: deals
        .filter((d) => d.status === status)
        .reduce((sum, d) => sum + (d.sellTotal ?? 0), 0),
    }),
  );

  const recentDeals = [...deals]
    .sort((a, b) => (b.dateOpened ?? "").localeCompare(a.dateOpened ?? ""))
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Brokerage performance at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Open pipeline value"
          value={compactMoney(pipelineValue)}
          sub={`${activeCount} active deals`}
          accent="indigo"
        />
        <KpiCard
          label="Realized margin"
          value={compactMoney(realizedMargin)}
          sub="Delivered & closed deals"
          accent="emerald"
        />
        <KpiCard
          label="Trading partners"
          value={`${suppliers + buyers}`}
          sub={`${suppliers} suppliers · ${buyers} buyers`}
          accent="teal"
        />
        <KpiCard
          label="Shipments in transit"
          value={`${inTransit}`}
          sub={`${shipments.length} total shipments`}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Realized margin over time
          </h2>
          <p className="mb-3 text-xs text-slate-400">By deal open month</p>
          <MarginTrendChart data={marginTrend} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Deal value by stage
          </h2>
          <p className="mb-3 text-xs text-slate-400">Pipeline funnel</p>
          <PipelineChart data={pipelineData} />
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-700">Recent deals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Buyer</th>
                <th>Status</th>
                <th className="num">Value</th>
                <th className="num">Margin</th>
                <th>Opened</th>
              </tr>
            </thead>
            <tbody>
              {recentDeals.map((d) => (
                <tr key={d.id}>
                  <td className="font-medium text-slate-900">{d.deal}</td>
                  <td>{d.buyer ?? "—"}</td>
                  <td>
                    <StatusBadge value={d.status} />
                  </td>
                  <td className="num">{money(d.sellTotal)}</td>
                  <td className="num text-emerald-600">{money(dealMargin(d))}</td>
                  <td>{shortDate(d.dateOpened)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
