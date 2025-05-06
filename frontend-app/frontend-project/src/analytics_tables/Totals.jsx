import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const BoqTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/Boq.xlsx")
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        setData(jsonData);
      });
  }, []);

  const formatCost = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "-";
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (data.length === 0) {
    return <div>Loading BOQ...</div>;
  }

  const processedData = data.map(row => {
    const amounts = parseFloat(row["Amounts"]) || 0;
    const salaryPerUnit = parseFloat(row["Salary cost per unit"]) || 0;
    const materialPerUnit = parseFloat(row["Material cost per unit"]) || 0;
    const machineryPerUnit = parseFloat(row["Machinery cost per unit"]) || 0;
    const totalPerUnit = parseFloat(row["Total unit cost"]) || 0;
    const totalCost = parseFloat(row["Total cost"]) || 0;

    const salaryCost = salaryPerUnit * amounts;
    const materialCost = materialPerUnit * amounts;
    const machineryCost = machineryPerUnit * amounts;

    return {
      locationWorks: row["Location"],
      task: row["Task"],
      units: row["Units"] || "",
      amounts,
      salaryPerUnit,
      materialPerUnit,
      machineryPerUnit,
      totalPerUnit,
      salaryCost,
      materialCost,
      machineryCost,
      totalCost
    };
  });

  const totalSums = processedData.reduce(
    (acc, row) => {
      acc.salaryCost += row.salaryCost;
      acc.materialCost += row.materialCost;
      acc.machineryCost += row.machineryCost;
      acc.totalCost += row.totalCost;
      return acc;
    },
    { salaryCost: 0, materialCost: 0, machineryCost: 0, totalCost: 0 }
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Forma 2 - Bill of Quantities </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Location</th>
              <th className="px-4 py-2 border border-r-4">Task</th>
              <th className="px-4 py-2 border">Units</th>
              <th className="px-4 py-2 border border-r-4">Amounts</th>
              <th className="px-4 py-2 border">Salary cost per unit</th>
              <th className="px-4 py-2 border">Material cost per unit</th>
              <th className="px-4 py-2 border border-r-4">Machinery cost per unit</th>
              <th className="px-4 py-2 border border-r-4">Total unit cost</th>
              <th className="px-4 py-2 border">Salary cost</th>
              <th className="px-4 py-2 border">Material cost</th>
              <th className="px-4 py-2 border border-r-4">Machinery cost</th>
              <th className="px-4 py-2 border">Total cost</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{row.locationWorks}</td>
                <td className="px-4 py-2 border border-r-4">{row.task}</td>
                <td className="px-4 py-2 border">{row.units}</td>
                <td className="px-4 py-2 border border-r-4">{row.amounts}</td>
                <td className="px-4 py-2 border">{formatCost(row.salaryPerUnit)}</td>
                <td className="px-4 py-2 border">{formatCost(row.materialPerUnit)}</td>
                <td className="px-4 py-2 border border-r-4">{formatCost(row.machineryPerUnit)}</td>
                <td className="px-4 py-2 border border-r-4">{formatCost(row.totalPerUnit)}</td>
                <td className="px-4 py-2 border">{formatCost(row.salaryCost)}</td>
                <td className="px-4 py-2 border">{formatCost(row.materialCost)}</td>
                <td className="px-4 py-2 border border-r-4">{formatCost(row.machineryCost)}</td>
                <td className="px-4 py-2 border">{formatCost(row.totalCost)}</td>
              </tr>
            ))}
            <tr className="font-bold bg-gray-200">
              <td colSpan="8" className="px-4 py-2 border text-right">TOTAL</td>
              <td className="px-4 py-2 border">{formatCost(totalSums.salaryCost)}</td>
              <td className="px-4 py-2 border">{formatCost(totalSums.materialCost)}</td>
              <td className="px-4 py-2 border border-r-4">{formatCost(totalSums.machineryCost)}</td>
              <td className="px-4 py-2 border">{formatCost(totalSums.totalCost)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BoqTable;
