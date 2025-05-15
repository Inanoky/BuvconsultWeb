import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BillOfQuantity() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const prompt = `You are analyzing a construction project database. Please match attendance timestamps and invoice data with works and locations. For each work item, estimate how much of each cost category (Salary, Materials, Machinery) was spent, and calculate Unit Cost = Total/Amount. Format response as JSON with: Location, Work, Units, Amounts, Salary, Materials, Machinery, Total, Unit Cost.`;

  useEffect(() => {
    setLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/analysis/financial-breakdown`, {
      params: { prompt }
    })
      .then(res => {
        const parsed = JSON.parse(res.data.response);
        setRows(parsed);
      })
      .catch(err => console.error("GPT Analysis failed:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📊 Financial Breakdown</h2>
      {loading ? <p>Loading GPT analysis...</p> : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Location / Work</th>
              <th className="p-2 text-right">Units</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-right">Unit Cost</th>
              <th className="p-2 text-right">Salary (€)</th>
              <th className="p-2 text-right">Materials (€)</th>
              <th className="p-2 text-right">Machinery (€)</th>
              <th className="p-2 text-right">Total (€)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{row.location} / {row.work}</td>
                <td className="p-2 text-right">{row.units}</td>
                <td className="p-2 text-right">{row.amounts}</td>
                <td className="p-2 text-right">{row.unit_cost}</td>
                <td className="p-2 text-right">{row.salary}</td>
                <td className="p-2 text-right">{row.materials}</td>
                <td className="p-2 text-right">{row.machinery}</td>
                <td className="p-2 text-right">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
