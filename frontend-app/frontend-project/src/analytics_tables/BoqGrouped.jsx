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

  // Format any numeric cell to two decimals
  const formatCell = (value) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return value;
  };

  // Destructure header rows and data rows
  const [headerRow1, headerRow2, ...dataRows] = sheetData;

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
                    // Determine classes for each cell
                    const base = "px-4 py-2 border border-gray-300";
                    const rightAlign = isLast && cidx === 0 ? "text-right" : "";
                    const thickBorder = isLast && cidx === row.length - 1 ? "border-r-4" : "";
                    const bg = isLast ? "bg-gray-200" : "";
                    return (
                      <td
                        key={cidx}
                        className={[base, rightAlign, thickBorder, bg].join(" ")}
                      >
                        {formatCell(cell)}
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