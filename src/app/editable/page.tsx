import { EditableView } from "@/components/EditableView";
import { PageHeader } from "@/components/PageHeader";
import { SetupNotice } from "@/components/SetupNotice";
import {
  getContacts,
  getDeals,
  getProducts,
  getShipments,
  isAirtableConfigured,
} from "@/lib/airtable";

export default async function EditablePage() {
  const description =
    "Edit records inline and write changes back to Airtable. Saves update every other page.";

  if (!isAirtableConfigured()) {
    return (
      <>
        <PageHeader title="Editable" description={description} />
        <SetupNotice />
      </>
    );
  }

  const [deals, contacts, products, shipments] = await Promise.all([
    getDeals(),
    getContacts(),
    getProducts(),
    getShipments(),
  ]);

  return (
    <>
      <PageHeader title="Editable" description={description} />
      <EditableView
        deals={deals}
        contacts={contacts}
        products={products}
        shipments={shipments}
      />
    </>
  );
}
