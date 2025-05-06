import RenderInvoiceTable from "../components/RenderInvoiceTable";
import InvoiceParsing from "../components/InvoiceParsing";
import Categorize from "../components/Categorize.jsx";
import AskAssistantAI from "../utilities/AskAssistantAI.jsx";
export default function Invoices() {
  return (
    <div className="p-8 space-y-10">
      <InvoiceParsing />
      <RenderInvoiceTable />
        <Categorize />
        <AskAssistantAI/>
    </div>
  );
}
