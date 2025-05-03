import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RenderInvoiceTable() {
  const [invoices, setInvoices] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [filters, setFilters] = useState({});

  const fetchInvoices = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/invoices/");
      setInvoices(res.data);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredInvoices = invoices.filter((invoice) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const fieldValue = String(invoice[key] ?? "").toLowerCase();
      return fieldValue.includes(value.toLowerCase());
    })
  );

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;

    const aVal = a[key] ?? "";
    const bVal = b[key] ?? "";

    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const columns = [
    { key: "id", label: "ID" },
    { key: "invoice_date", label: "Date" },
    { key: "invoice_number", label: "Number" },
    { key: "seller", label: "Seller" },
    { key: "buyer", label: "Buyer" },
    { key: "item", label: "Item" },
    { key: "quantity", label: "Qty" },
    { key: "unit", label: "Unit" },
    { key: "price", label: "Price" },
    { key: "sum", label: "Sum" },
    { key: "currency", label: "Currency" },
    { key: "category", label: "Category" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">All Invoices</h2>

      {invoices.length === 0 ? (
        <p className="text-gray-500 italic">No invoices found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                {columns.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="p-2 border cursor-pointer select-none"
                  >
                    {label}{" "}
                    <span className="text-gray-400">{renderSortIcon(key)}</span>
                  </th>
                ))}
              </tr>
              <tr className="bg-gray-50">
                {columns.map(({ key }) => (
                  <th key={key} className="p-1 border">
                    <input
                      type="text"
                      value={filters[key] || ""}
                      onChange={(e) => handleFilterChange(key, e.target.value)}
                      placeholder="Filter..."
                      className="w-full px-1 py-0.5 border rounded text-xs"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="p-2 border">{inv.id}</td>
                  <td className="p-2 border">{inv.invoice_date}</td>
                  <td className="p-2 border">
                    {inv.file_id ? (
                      <a
                        href={`https://drive.google.com/file/d/${inv.file_id}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {inv.invoice_number || "N/A"}
                      </a>
                    ) : (
                      inv.invoice_number || "N/A"
                    )}
                  </td>
                  <td className="p-2 border">{inv.seller}</td>
                  <td className="p-2 border">{inv.buyer}</td>
                  <td className="p-2 border">{inv.item}</td>
                  <td className="p-2 border">{inv.quantity ?? ""}</td>
                  <td className="p-2 border">{inv.unit}</td>
                  <td className="p-2 border">{Number(inv.price).toFixed(2)}</td>
                  <td className="p-2 border">{Number(inv.sum ?? 0).toFixed(2)}</td>
                  <td className="p-2 border">{inv.currency}</td>
                  <td className="p-2 border">{inv.category || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
