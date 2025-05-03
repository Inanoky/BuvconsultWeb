import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function OpenDayEditor({ date, onClose }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/site-diary/${date}`)
      .then(res => setRows(res.data))
      .catch(err => console.error(err));
  }, [date]);

  const handleChange = (idx, key, value) => {
    const updated = [...rows];
    updated[idx][key] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { date, location: '', work: '', unit: '', amount: 0, workers: 0, comments: '' }]);
  };

  const deleteRow = (id, idx) => {
    if (id) axios.delete(`http://localhost:8000/api/site-diary/${id}`);
    const updated = [...rows];
    updated.splice(idx, 1);
    setRows(updated);
  };

  const saveRow = (row, idx) => {
    if (row.id) {
      axios.put(`http://localhost:8000/api/site-diary/${row.id}`, row)
        .then(res => console.log("Updated", res.data));
    } else {
      axios.post(`http://localhost:8000/api/site-diary/`, row)
        .then(res => {
          const updated = [...rows];
          updated[idx] = res.data;
          setRows(updated);
        });
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded shadow">
      <h3 className="font-bold text-lg mb-2">Editing Site Diary for {date}</h3>
      <button className="mb-2 text-red-500" onClick={onClose}>Close</button>
      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th>Location</th><th>Work</th><th>Unit</th><th>Amount</th><th>Workers</th><th>Comments</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              {['location','work','unit','amount','workers','comments'].map(key => (
                <td key={key}><input value={row[key]} onChange={e => handleChange(idx, key, e.target.value)} className="w-full" /></td>
              ))}
              <td>
                <button onClick={() => saveRow(row, idx)} className="text-green-600">💾</button>
                <button onClick={() => deleteRow(row.id, idx)} className="text-red-600 ml-2">🗑</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="mt-2 text-blue-500">+ Add Row</button>
    </div>
  );
}
