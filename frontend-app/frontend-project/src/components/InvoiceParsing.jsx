import React, { useState } from "react";
import axios from "axios";

export default function InvoiceParsing() {
  const [prompt, setPrompt] = useState(`You are helpful construction invoice parsing assistant.
Analyze invoice, extract information in JSON array key pairs."
From each invoice you need to extract : invoice_date, invoice_number, seller, buyer, item, quantity, unit, price, sum, currency
Do not add comments before or after response as your JSON response will be used for parsing in Python directly and saving to database.
For any empty field return null, don't leave empty strings
format dates as dd.mm.yyyyy
do not use currency symbols
for sellers and buyers fields only use company names 
use point for decimal
price give with 2 numbers after decimal.`);

  const handleParse = async () => {
    try {
      await axios.post("http://localhost:8000/api/invoices/parse", {
        prompt,
      });
      alert("Parsing started. Check console for processing updates.");
    } catch (error) {
      console.error("Parsing failed:", error);
      alert("Parsing failed. Check console for details.");
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm("Clear all invoices and scanned files?");
    if (!confirmed) return;

    try {
      const res = await axios.post("http://localhost:8000/api/invoices/clearall");
      alert(res.data.message);
    } catch (error) {
      console.error("Clearing failed:", error);
      alert("Clearing failed. Check console.");
    }
  };

  return (
    <div className="p-6 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">Invoice Parsing</h2>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={10}
        className="w-full border p-2 text-sm mb-4"
      />

      <div className="flex gap-4">
        <button
          onClick={handleParse}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Parse and Load Invoices
        </button>

        <button
          onClick={handleClear}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Clear Database
        </button>
      </div>
    </div>
  );
}
