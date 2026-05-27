import { PageHeader } from "@/components/PageHeader";
import { SetupNotice } from "@/components/SetupNotice";
import { getProducts, isAirtableConfigured } from "@/lib/airtable";
import { moneyPrecise, weight } from "@/lib/format";

export default async function ProductsPage() {
  const description = "Catalog of goods brokered, with buy/sell margins.";
  if (!isAirtableConfigured()) {
    return (
      <>
        <PageHeader title="Products" description={description} />
        <SetupNotice />
      </>
    );
  }

  const products = await getProducts();

  return (
    <>
      <PageHeader title="Products" description={description} />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>HS Code</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Origin</th>
                <th>Unit</th>
                <th className="num">Weight</th>
                <th className="num">Buy price</th>
                <th className="num">Sell price</th>
                <th className="num">Margin / unit</th>
                <th className="num">Markup</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const margin = (p.sellPrice ?? 0) - (p.buyPrice ?? 0);
                const markup = p.buyPrice ? (margin / p.buyPrice) * 100 : 0;
                return (
                  <tr key={p.id}>
                    <td className="font-medium text-slate-900">{p.product}</td>
                    <td className="font-mono text-xs text-slate-500">
                      {p.hsCode ?? "—"}
                    </td>
                    <td>{p.category ?? "—"}</td>
                    <td>{p.supplier ?? "—"}</td>
                    <td>{p.countryOfOrigin ?? "—"}</td>
                    <td className="text-slate-500">{p.unit ?? "—"}</td>
                    <td className="num text-slate-500">{weight(p.weightKg)}</td>
                    <td className="num">{moneyPrecise(p.buyPrice)}</td>
                    <td className="num">{moneyPrecise(p.sellPrice)}</td>
                    <td className="num font-medium text-emerald-600">
                      {moneyPrecise(margin)}
                    </td>
                    <td className="num text-slate-500">{markup.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
