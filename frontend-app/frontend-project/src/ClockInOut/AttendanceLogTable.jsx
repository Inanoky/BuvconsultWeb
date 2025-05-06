// AttendanceLogTable.jsx – Table Only (Disconnected from DB actions)
import React, { useEffect, useState } from "react";

export default function AttendanceLogTable() {
  const [workers, setWorkers] = useState([]);
  const [works, setWorks] = useState([]);
  const [actionLog, setActionLog] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/workers/").then((res) => res.json()).then(setWorkers);
    fetch("http://localhost:8000/api/works/").then((res) => res.json()).then(setWorks);
    fetch("http://localhost:8000/api/attendance/").then((res) => res.json()).then(setActionLog);
  }, []);

  const handleTimeEdit = async (id, newTime) => {
    await fetch(`http://localhost:8000/api/attendance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp: newTime }),
    });
    const updated = await fetch("http://localhost:8000/api/attendance/").then(res => res.json());
    setActionLog(updated);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">📋 Attendance Log</h1>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Surname</th>
            <th className="p-2 border">Clock In</th>
            <th className="p-2 border">Clock Out</th>
            <th className="p-2 border">Work</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Hours</th>
            <th className="p-2 border">Cost</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            const rows = [];
            const sorted = [...actionLog].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            const usedIds = new Set();

            for (let i = 0; i < sorted.length; i++) {
              const inEntry = sorted[i];
              if (usedIds.has(inEntry.id) || inEntry.action !== "Clock In") continue;

              const outEntry = sorted.slice(i + 1).find(e =>
                e.worker_id === inEntry.worker_id &&
                e.action === "Clock Out" &&
                !usedIds.has(e.id)
              );

              usedIds.add(inEntry.id);
              if (outEntry) usedIds.add(outEntry.id);

              const worker = workers.find(w => w.id === inEntry.worker_id);
              const role = worker?.role || "-";
              const hourlyRaw = worker?.salary || "0";
              const hourly = parseFloat(hourlyRaw.toString().replace(/[^\d.]/g, ""));
              const work = works.find(w => w.id === (outEntry?.work_id || inEntry.work_id))?.task || "-";

              const clockInTime = new Date(inEntry.timestamp);
              const clockOutTime = outEntry ? new Date(outEntry.timestamp) : null;
              const hours = clockOutTime ? ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2) : "-";
              const cost = clockOutTime ? `€${(hourly * parseFloat(hours)).toFixed(2)}` : "-";

              rows.push(
                <tr key={inEntry.id}>
                  <td className="p-2 border">{worker?.name || "-"}</td>
                  <td className="p-2 border">{worker?.surname || "-"}</td>
                  <td className="p-2 border">
                    <input
                      type="datetime-local"
                      value={clockInTime.toISOString().slice(0, 16)}
                      onChange={(e) => handleTimeEdit(inEntry.id, e.target.value)}
                      className="text-xs"
                    />
                  </td>
                  <td className="p-2 border">
                    {clockOutTime ? (
                      <input
                        type="datetime-local"
                        value={clockOutTime.toISOString().slice(0, 16)}
                        onChange={(e) => handleTimeEdit(outEntry.id, e.target.value)}
                        className="text-xs"
                      />
                    ) : "-"}
                  </td>
                  <td className="p-2 border">{work}</td>
                  <td className="p-2 border">{role}</td>
                  <td className="p-2 border">{hours}</td>
                  <td className="p-2 border">{cost}</td>
                </tr>
              );
            }
            return rows;
          })()}
        </tbody>
      </table>
    </div>
  );
}
