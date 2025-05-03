import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Categorize({ fetchInvoices }) {
  const [categories, setCategories] = useState(() => {
    const stored = localStorage.getItem("invoiceCategories");
    return stored ? JSON.parse(stored) : [];
  });
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    localStorage.setItem("invoiceCategories", JSON.stringify(categories));
  }, [categories]);

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCategory("");
    }
  };

  const handleRemoveCategories = () => {
    if (window.confirm("Remove all categories?")) {
      setCategories([]);
      localStorage.removeItem("invoiceCategories");
    }
  };

  const handleCategorize = async () => {
  if (categories.length === 0) return;

  await axios.post("http://localhost:8000/api/invoices/categorize", {
    categories,
  });

  alert("Invoices categorized!");
  fetchInvoices();
};

  return (
    <div className="p-6 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">Categorize Invoices</h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Enter category"
          className="border px-2 py-1 rounded w-full max-w-sm"
        />
        <button
          onClick={handleAddCategory}
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </div>

      {categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <span
              key={i}
              className="bg-gray-200 text-sm px-2 py-1 rounded"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleCategorize}
          disabled={categories.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Categorize Invoices
        </button>

        <button
          onClick={handleRemoveCategories}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Remove Categories
        </button>
      </div>
    </div>
  );
}
