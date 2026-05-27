import { ContactsView } from "@/components/ContactsView";
import { PageHeader } from "@/components/PageHeader";
import { SetupNotice } from "@/components/SetupNotice";
import { getContacts, isAirtableConfigured } from "@/lib/airtable";

export default async function ContactsPage() {
  const description = "Suppliers you source from and buyers you sell to.";
  if (!isAirtableConfigured()) {
    return (
      <>
        <PageHeader title="Contacts" description={description} />
        <SetupNotice />
      </>
    );
  }

  const contacts = await getContacts();
  return (
    <>
      <PageHeader title="Contacts" description={description} />
      <ContactsView contacts={contacts} />
    </>
  );
}
