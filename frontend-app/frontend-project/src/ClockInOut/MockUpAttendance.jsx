// src/components/MockUpAttendance.jsx
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';

export default function MockUpAttendance() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const loadExcel = async () => {
      const response = await axios.get('/attendance.xlsx', {
        responseType: 'arraybuffer',
      });
      const workbook = XLSX.read(response.data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = data[0];
      const rowData = data.slice(1).map(row =>
        headers.reduce((acc, header, i) => {
          acc[header] = row[i] ?? "-";
          return acc;
        }, {})
      );
      setRows(rowData);
    };
    loadExcel();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-purple-800 mb-4">📋 Attendance Log</h2>
      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            {rows[0] &&
              Object.keys(rows[0]).map((key, index) => (
                <th key={index} className="p-2 border">{key}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              {Object.values(row).map((val, j) => (
                <td key={j} className="p-2 border text-center">{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
