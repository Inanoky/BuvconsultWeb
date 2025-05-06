import React, { useEffect, useState } from "react";

export default function ClockInOut() {
  const [workers, setWorkers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [works, setWorks] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [status, setStatus] = useState({});
  const [log, setLog] = useState([]); // ⬅️ MOCKED log

  const [showModal, setShowModal] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [workId, setWorkId] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/workers/").then(res => res.json()).then(setWorkers);
    fetch("http://localhost:8000/api/locations/").then(res => res.json()).then(setLocations);
    fetch("http://localhost:8000/api/works/").then(res => res.json()).then(setWorks);
  }, []);

  const handleClockIn = () => {
    if (!selectedWorker) return alert("Select a worker");
    if (status[selectedWorker] === "Clocked In") return alert("Already clocked in");

    setStatus(prev => ({ ...prev, [selectedWorker]: "Clocked In" }));
    const now = new Date().toISOString();
    setLog(prev => [...prev, { workerId: selectedWorker, action: "Clock In", timestamp: now }]);
    alert("✅ Clocked in!");
  };

  const handleClockOut = () => {
    if (!selectedWorker) return alert("Select a worker");
    if (status[selectedWorker] !== "Clocked In") return alert("You must clock in first");

    setShowModal(true);
  };

  const confirmClockOut = () => {
    if (!locationId || !workId) return alert("Select location and work");

    setStatus(prev => ({ ...prev, [selectedWorker]: "Clocked Out" }));
    const now = new Date().toISOString();
    setLog(prev => [...prev, {
      workerId: selectedWorker,
      action: "Clock Out",
      timestamp: now,
      locationId,
      workId
    }]);
    setLocationId("");
    setWorkId("");
    setShowModal(false);
    alert("🔴 Clocked out!");
  };

  const getWorksForLocation = (locId) =>
    works.filter(w => w.location_id === parseInt(locId));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-indigo-700">🕒 Clock In / Out</h1>

      <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)} className="border p-2 rounded w-full">
        <option value="">-- Select Worker --</option>
        {workers.map(w => (
          <option key={w.id} value={w.id}>{w.name} {w.surname}</option>
        ))}
      </select>

      <div className="flex gap-4">
        <button onClick={handleClockIn} className="bg-green-600 text-white px-4 py-2 rounded">✅ Clock In</button>
        <button onClick={handleClockOut} className="bg-red-600 text-white px-4 py-2 rounded">🔴 Clock Out</button>
      </div>

      {/* Clock Out Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4">
            <h2 className="font-semibold text-indigo-700">Select Location & Work</h2>

            <select value={locationId} onChange={(e) => {
              setLocationId(e.target.value);
              setWorkId("");
            }} className="border p-2 w-full">
              <option value="">-- Location --</option>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>

            <select value={workId} onChange={(e) => setWorkId(e.target.value)} className="border p-2 w-full">
              <option value="">-- Work --</option>
              {getWorksForLocation(locationId).map(w => (
                <option key={w.id} value={w.id}>{w.task}</option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={confirmClockOut} className="bg-indigo-600 text-white px-4 py-2 rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Mocked Attendance Log */}
      <div>
        <h2 className="text-lg font-semibold">🧾 Log</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Action</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Work</th>
            </tr>
          </thead>
          <tbody>
            {log.map((entry, i) => {
              const worker = workers.find(w => w.id == entry.workerId);
              const loc = locations.find(l => l.id == entry.locationId);
              const work = works.find(w => w.id == entry.workId);
              return (
                <tr key={i}>
                  <td className="p-2 border">{worker?.name} {worker?.surname}</td>
                  <td className="p-2 border">{entry.action}</td>
                  <td className="p-2 border">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="p-2 border">{loc?.name || "-"}</td>
                  <td className="p-2 border">{work?.task || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
