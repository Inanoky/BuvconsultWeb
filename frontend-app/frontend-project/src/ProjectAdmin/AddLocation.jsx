import React, { useState, useEffect } from 'react';

export default function AddLocation() {
  const [locationName, setLocationName] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/locations/`)
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error('Failed to load locations:', err));
  }, []);

  const addLocation = async () => {
    if (!locationName.trim()) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: locationName })
      });

      if (!res.ok) {
        const data = await res.json();
        alert('❌ Error: ' + (data.detail || 'Unknown error'));
        return;
      }

      const newLocation = await res.json();
      setLocations([...locations, newLocation]);
      setLocationName('');
    } catch (err) {
      console.error('❌ Failed to add location:', err);
    }
  };

  const deleteLocation = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setLocations(locations.filter((l) => l.id !== id));
      } else {
        const data = await res.json();
        alert('❌ Delete failed: ' + (data.detail || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Failed to delete location:', err);
    }
  };

  const clearAll = async () => {
    const confirm = window.confirm("⚠️ This will delete ALL locations and works. Are you sure?");
    if (!confirm) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/locations/clear-all`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setLocations([]);
        alert('✅ Database cleared successfully.');
      } else {
        const data = await res.json();
        alert('❌ Failed to clear: ' + (data.detail || 'Unknown error'));
      }
    } catch (err) {
      console.error('❌ Failed to clear database:', err);
    }
  };


  return (
      <div className="space-y-4 pt-10 border-t border-indigo-200">
        <h2 className="text-lg font-semibold text-indigo-800">📍 Add Location</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
              type="text"
              placeholder="Location name"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="border border-indigo-300 p-2 rounded"
          />
        </div>

        <button
            onClick={addLocation}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          ➕ Add Location
        </button>
        <button
            onClick={clearAll}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition ml-3"
        >
          🧹 Clear Database
        </button>

        {locations.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-indigo-800">📋 Current Locations</h2>
              <table className="w-full border border-indigo-200 text-sm mt-2">
                <thead className="bg-indigo-100">
                <tr>
                  <th className="border px-3 py-1">Name</th>
                  <th className="border px-3 py-1 text-center">Actions</th>
                </tr>
                </thead>
                <tbody>
                {locations.map((loc) => (
                    <tr key={loc.id}>
                      <td className="border px-3 py-1">{loc.name}</td>
                      <td className="border px-3 py-1 text-center">
                        <button
                            onClick={() => deleteLocation(loc.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}
      </div>
  );
}
