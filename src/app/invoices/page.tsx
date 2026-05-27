import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "Invoices — TradeBridge",
};

export default function InvoicesPage() {
  return (
    <>
      <PageHeader
        title="Invoice Generator"
        description="Fill in the details, watch the invoice update live, then download it as a PDF."
      />
      <InvoiceGenerator />
    </>
  );
}
