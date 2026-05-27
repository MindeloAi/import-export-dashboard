import { PageHeader } from "@/components/PageHeader";
import { SetupNotice } from "@/components/SetupNotice";
import { ShipmentsView } from "@/components/ShipmentsView";
import { getShipments, isAirtableConfigured } from "@/lib/airtable";

export default async function ShipmentsPage() {
  const description = "Freight and logistics tracking for each deal.";
  if (!isAirtableConfigured()) {
    return (
      <>
        <PageHeader title="Shipments" description={description} />
        <SetupNotice />
      </>
    );
  }

  const shipments = await getShipments();
  return (
    <>
      <PageHeader title="Shipments" description={description} />
      <ShipmentsView shipments={shipments} />
    </>
  );
}
