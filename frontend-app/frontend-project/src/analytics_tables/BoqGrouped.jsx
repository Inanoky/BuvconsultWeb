import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const BoqGrouped = () => {
  const [sheetData, setSheetData] = useState([]);

  useEffect(() => {
    fetch("/Boq_grouped.xlsx")
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const worksheet = workbook.Sheets["Summary"];
        // Read raw arrays: each inner array is a row
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        setSheetData(data);
      })
      .catch((err) => console.error("Error loading Excel:", err));
  }, []);

  if (!sheetData.length) {
    return <div>Loading summary...</div>;
  }

  // Destructure header rows and data rows
  const [headerRow1, headerRow2, ...dataRows] = sheetData;
  // Find the index of the "Amount" column (case-insensitive)
  const amountColIndex = headerRow2.findIndex(
    (header) => header.toString().trim().toLowerCase() === "amount"
  );

  /**
   * Formats a cell value.
   * - Numeric values get two decimal places.
   * - Non-numeric values in the Amount column have any leading "EUR " stripped.
   * @param {*} value - Original cell value
   * @param {boolean} isAmount - Whether this is the Amount column
   */
  const formatCell = (value, isAmount = false) => {
    // Remove non-numeric characters for parsing (commas, currency symbols)
    const raw = value.toString().replace(/[^[0-9\-.]]/g, "");
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return isAmount ? formatted : `€ ${formatted}`;
    }
    // If not a number and in Amount column, strip leadingEUR prefix
    if (isAmount && typeof value === 'string') {
      return value.replace(/^EUR\s*/, '').trim();
    }
    return value;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Summary Table</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {headerRow1.map((cell, idx) => (
                <th key={idx} className="px-4 py-2 border border-gray-300">
                  {cell}
                </th>
              ))}
            </tr>
            <tr>
              {headerRow2.map((cell, idx) => (
                <th key={idx} className="px-4 py-2 border border-gray-300">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ridx) => {
              const isLast = ridx === dataRows.length - 1;
              return (
                <tr
                  key={ridx}
                  className={isLast ? "bg-gray-200 font-bold" : "hover:bg-gray-50"}
                >
                  {row.map((cell, cidx) => {
                    const base = "px-4 py-2 border border-gray-300";
                    const rightAlign = isLast && cidx === 0 ? "text-right" : "";
                    const thickBorder = isLast && cidx === row.length - 1 ? "border-r-4" : "";
                    const bg = isLast ? "bg-gray-200" : "";
                    const isAmountCell = cidx === amountColIndex;
                    return (
                      <td
                        key={cidx}
                        className={[base, rightAlign, thickBorder, bg].join(" ")}
                      >
                        {formatCell(cell, isAmountCell)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BoqGrouped;