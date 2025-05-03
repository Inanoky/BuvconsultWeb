import RenderInvoiceTable from "../components/RenderInvoiceTable";
import InvoiceParsing from "../components/InvoiceParsing";
import Categorize from "../components/Categorize.jsx";

export default function Invoices() {
  return (
    <div className="p-8 space-y-10">
      <InvoiceParsing />
      <RenderInvoiceTable />
        <Categorize />
    </div>
  );
}
