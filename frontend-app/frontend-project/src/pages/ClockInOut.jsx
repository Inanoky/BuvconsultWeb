import React, { useEffect, useState } from "react";

export default function ClockInOut() {
  const [workers, setWorkers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [works, setWorks] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [actionLog, setActionLog] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [workId, setWorkId] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/workers/").then((res) => res.json()).then(setWorkers);
    fetch("http://localhost:8000/api/locations/").then((res) => res.json()).then(setLocations);
    fetch("http://localhost:8000/api/works/").then((res) => res.json()).then(setWorks);
    fetch("http://localhost:8000/api/attendance/").then((res) => res.json()).then(setActionLog);
  }, []);

  const handleClock = (action) => {
    if (!selectedWorker) return alert("Select a worker");
    const lastAction = [...actionLog].reverse().find((log) => log.worker_id === parseInt(selectedWorker));

    if (action === "Clock In" && lastAction?.action === "Clock In") {
      alert("Already clocked in");
      return;
    }
    if (action === "Clock Out" && (!lastAction || lastAction.action !== "Clock In")) {
      alert("Must clock in first");
      return;
    }
    if (action === "Clock Out") {
      setShowModal(true);
    } else {
      sendLogToBackend(action);
    }
  };

  const sendLogToBackend = async (action, locId = null, workIdVal = null) => {
    const worker = workers.find((w) => w.id === parseInt(selectedWorker));
    const res = await fetch("http://localhost:8000/api/attendance/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        worker_id: parseInt(selectedWorker),
        action,
        location_id: locId,
        work_id: workIdVal,
        worker_profession: worker?.role || ""
      })
    });
    if (res.ok) {
      await fetchAll();
    }
    setLocationId("");
    setWorkId("");
    setShowModal(false);
  };

  const confirmClockOut = () => {
    if (!locationId || !workId) return alert("Select location and work");
    sendLogToBackend("Clock Out", parseInt(locationId), parseInt(workId));
  };

  const clearLog = async () => {
    if (!window.confirm("Clear attendance log?")) return;
    await fetch("http://localhost:8000/api/attendance/clear", { method: "DELETE" });
    setActionLog([]);
  };

  const handleTimeEdit = async (id, newTime) => {
    const editedEntry = actionLog.find(entry => entry.id === id);
    const clockOutTime = new Date(newTime);

    // If it's a clock out, compare to matching clock in
    if (editedEntry?.action === "Clock Out") {
      const matchingIn = [...actionLog].reverse().find(e => e.worker_id === editedEntry.worker_id && e.action === "Clock In" && new Date(e.timestamp) < clockOutTime);
      if (!matchingIn) {
        alert("❌ Clock Out time cannot be before Clock In time.");
        return;
      }
    }

    await fetch(`http://localhost:8000/api/attendance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp: newTime }),
    });
    fetchAll();
  };

  const fetchAll = async () => {
    const [logRes, workerRes, workRes] = await Promise.all([
      fetch("http://localhost:8000/api/attendance/"),
      fetch("http://localhost:8000/api/workers/"),
      fetch("http://localhost:8000/api/works/")
    ]);
    const [logData, workerData, workData] = await Promise.all([
      logRes.json(),
      workerRes.json(),
      workRes.json()
    ]);
    setActionLog(logData);
    setWorkers(workerData);
    setWorks(workData);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">🕒 Clock In / Out</h1>

      <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)} className="border p-2 rounded w-full">
        <option value="">-- Select Worker --</option>
        {workers.map((w) => (
          <option key={w.id} value={w.id}>{w.name} {w.surname}</option>
        ))}
      </select>

      <div className="flex gap-4">
        <button onClick={() => handleClock("Clock In")} className="bg-green-600 text-white px-4 py-2 rounded">✅ Clock In</button>
        <button onClick={() => handleClock("Clock Out")} className="bg-red-600 text-white px-4 py-2 rounded">🔴 Clock Out</button>
        <button onClick={clearLog} className="ml-auto bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">🧹 Clear Log</button>
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/40 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
            <h2 className="font-semibold text-indigo-700">Select Location & Work</h2>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="border p-2 w-full">
              <option value="">-- Location --</option>
              {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
            <select value={workId} onChange={(e) => setWorkId(e.target.value)} className="border p-2 w-full">
              <option value="">-- Work --</option>
              {works.map((w) => <option key={w.id} value={w.id}>{w.task}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={confirmClockOut} className="bg-indigo-600 text-white px-4 py-2 rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-bold mb-2">📜 Attendance Log</h2>
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
                      {outEntry ? (
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
    </div>
  );
}
