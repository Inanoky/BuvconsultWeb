// src/components/AddWorker.jsx

import React, { useState, useEffect } from 'react';

export default function AddWorker() {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    surname: '',
    code: '',
    role: '',
    salary: ''
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/workers/')
      .then((res) => res.json())
      .then((data) => setWorkers(data))
      .catch((err) => console.error('Failed to load workers:', err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addWorker = async () => {
    const { name, surname, code, role, salary } = form;
    if (!name || !surname || !code || !role || !salary) return;

    try {
      const res = await fetch('http://localhost:8000/api/workers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          surname,
          code,
          role,
          salary: parseFloat(salary)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        alert('❌ Error: ' + (data.detail || 'Unknown error'));
        return;
      }

      const newWorker = await res.json();
      setWorkers([...workers, newWorker]);
      setForm({ name: '', surname: '', code: '', role: '', salary: '' });
    } catch (err) {
      console.error('❌ Failed to add worker:', err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-indigo-800">➕ Add Worker</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border border-indigo-300 p-2 rounded" />
        <input name="surname" value={form.surname} onChange={handleChange} placeholder="Surname" className="border border-indigo-300 p-2 rounded" />
        <input name="code" value={form.code} onChange={handleChange} placeholder="Personal Code" className="border border-indigo-300 p-2 rounded" />
        <input name="role" value={form.role} onChange={handleChange} placeholder="Role" className="border border-indigo-300 p-2 rounded" />
        <input name="salary" type="number" value={form.salary} onChange={handleChange} placeholder="Hourly Salary (€)" className="border border-indigo-300 p-2 rounded" />
      </div>

      <button onClick={addWorker} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
        ➕ Add Worker
      </button>

      {workers.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-indigo-800">📋 Current Workers</h2>
          <table className="w-full border border-indigo-200 text-sm mt-2">
            <thead className="bg-indigo-100">
              <tr>
                <th className="border px-3 py-1">Name</th>
                <th className="border px-3 py-1">Surname</th>
                <th className="border px-3 py-1">Code</th>
                <th className="border px-3 py-1">Role</th>
                <th className="border px-3 py-1">Hourly Salary</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id}>
                  <td className="border px-3 py-1">{w.name}</td>
                  <td className="border px-3 py-1">{w.surname}</td>
                  <td className="border px-3 py-1">{w.code}</td>
                  <td className="border px-3 py-1">{w.role}</td>
                  <td className="border px-3 py-1">{w.salary} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
