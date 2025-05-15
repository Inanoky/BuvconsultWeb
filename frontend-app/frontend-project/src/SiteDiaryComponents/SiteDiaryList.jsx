// SiteDiaryList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OpenDayEditor from './OpenDayEditor';

export default function SiteDiaryList() {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({ date: '', location: '', work: '' });

  const fetchData = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/api/site-diary/`)
      .then(res => setEntries(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearDiary = () => {
    if (confirm("Are you sure you want to delete all site diary entries?")) {
      axios.delete(`${import.meta.env.VITE_API_URL}/api/site-diary/`)
        .then(() => fetchData());
    }
  };

  const filteredEntries = entries.filter(e =>
    (filters.date === '' || e.date.includes(filters.date)) &&
    (filters.location === '' || e.location.toLowerCase().includes(filters.location.toLowerCase())) &&
    (filters.work === '' || e.work.toLowerCase().includes(filters.work.toLowerCase()))
  );

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Site Diary Table</h2>
        <button onClick={clearDiary} className="bg-red-600 text-white px-3 py-1 rounded">Clear Diary</button>
      </div>

      <table className="w-full border text-sm mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">
              Date<br />
              <input
                className="w-full border px-1"
                value={filters.date}
                onChange={e => setFilters({ ...filters, date: e.target.value })}
              />
            </th>
            <th className="p-2">
              Location<br />
              <input
                className="w-full border px-1"
                value={filters.location}
                onChange={e => setFilters({ ...filters, location: e.target.value })}
              />
            </th>
            <th className="p-2">
              Work<br />
              <input
                className="w-full border px-1"
                value={filters.work}
                onChange={e => setFilters({ ...filters, work: e.target.value })}
              />
            </th>
            <th className="p-2">Unit</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Workers</th>
            <th className="p-2">Comments</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((row, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2 text-blue-600 cursor-pointer" onClick={() => setSelectedDate(row.date)}>{row.date}</td>
              <td className="p-2">{row.location}</td>
              <td className="p-2">{row.work}</td>
              <td className="p-2">{row.unit}</td>
              <td className="p-2 text-right">{row.amount}</td>
              <td className="p-2 text-right">{row.workers}</td>
              <td className="p-2">{row.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDate && <OpenDayEditor date={selectedDate} onClose={() => setSelectedDate(null)} />}
    </div>
  );
}
