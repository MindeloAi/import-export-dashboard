import { DealsView } from "@/components/DealsView";
import { PageHeader } from "@/components/PageHeader";
import { SetupNotice } from "@/components/SetupNotice";
import { getDeals, isAirtableConfigured } from "@/lib/airtable";

export default async function DealsPage() {
  const description = "Every brokered transaction, from lead to close.";
  if (!isAirtableConfigured()) {
    return (
      <>
        <PageHeader title="Deals" description={description} />
        <SetupNotice />
      </>
    );
  }

  const deals = await getDeals();
  return (
    <>
      <PageHeader title="Deals" description={description} />
      <DealsView deals={deals} />
    </>
  );
}
