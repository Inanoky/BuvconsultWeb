import React, { useState, useEffect } from 'react';

export default function TreeView() {
  const [tree, setTree] = useState({});
  const [locUnits, setLocUnits] = useState({});
  const [locAmounts, setLocAmounts] = useState({});
  const [workUnits, setWorkUnits] = useState({});
  const [workAmounts, setWorkAmounts] = useState({});
  const [workIds, setWorkIds] = useState({});

  // Fetch data from backend
  useEffect(() => {
    async function fetchData() {
      try {
        const [locRes, workRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/locations/`),
          fetch(`${import.meta.env.VITE_API_URL}/api/works/`)
        ]);

        if (!locRes.ok || !workRes.ok) {
          console.error('Failed to fetch data');
          return;
        }

        const locs = await locRes.json();
        const works = await workRes.json();

        const treeData = {};
        const workIdMap = {};
        const locUnitsMap = {};
        const locAmountsMap = {};
        const workUnitsMap = {};
        const workAmountsMap = {};

        locs.forEach(loc => {
          treeData[loc.name] = [];
          locUnitsMap[loc.name] = loc.units || '';
          locAmountsMap[loc.name] = loc.amounts || '';
        });

        works.forEach(work => {
          const locName = locs.find(l => l.id === work.location_id)?.name;
          if (!locName) return;
          treeData[locName].push(work.task);
          workIdMap[`${locName}_${work.task}`] = work.id;
          workUnitsMap[`${locName}_${work.task}`] = work.units || '';
          workAmountsMap[`${locName}_${work.task}`] = work.amounts || '';
        });

        setTree(treeData);
        setLocUnits(locUnitsMap);
        setLocAmounts(locAmountsMap);
        setWorkIds(workIdMap);
        setWorkUnits(workUnitsMap);
        setWorkAmounts(workAmountsMap);
      } catch (err) {
        console.error('Error loading tree data:', err);
      }
    }

    fetchData();
  }, []);

  // --- API Update Calls ---
  const updateLocation = async (name) => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/locations/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        units: locUnits[name],
        amounts: parseFloat(locAmounts[name]) || 0
      })
    });
  };

  const updateWork = async (locName, task) => {
    const id = workIds[`${locName}_${task}`];
    await fetch(`${import.meta.env.VITE_API_URL}/api/works/update/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        units: workUnits[`${locName}_${task}`],
        amounts: parseFloat(workAmounts[`${locName}_${task}`]) || 0
      })
    });
  };

  // --- Tree Rendering with Editable Fields ---


  const saveAllChanges = async () => {
  // Save all locations
  for (const locName of Object.keys(locUnits)) {
    await fetch(`${import.meta.env.VITE_API_URL}/api/locations/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: locName,
        units: locUnits[locName],
        amounts: parseFloat(locAmounts[locName]) || 0
      })
    });
  }

  // Save all works
  for (const key of Object.keys(workUnits)) {
    const [locName, task] = key.split(/_(.*)/); // Split only on first underscore
    const workId = workIds[key];
    if (!workId) continue;

    await fetch(`${import.meta.env.VITE_API_URL}/api/works/update/${workId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        units: workUnits[key],
        amounts: parseFloat(workAmounts[key]) || 0
      })
    });
  }

  alert("✅ All changes saved!");
};








  const renderTree = () => {
  return (
    <ul className="text-sm">
      {Object.entries(tree).map(([locName, tasks]) => (
        <li key={locName} className="mb-3">
          <div className="flex items-center gap-2 font-semibold text-indigo-700 mb-1">
            <span>{locName}</span>
            <input
              className="border px-1 w-20 text-xs"
              placeholder="Units"
              value={locUnits[locName]}
              onChange={(e) => setLocUnits({ ...locUnits, [locName]: e.target.value })}
            />
            <input
              className="border px-1 w-20 text-xs"
              placeholder="Amount"
              value={locAmounts[locName]}
              onChange={(e) => setLocAmounts({ ...locAmounts, [locName]: e.target.value })}
            />

          </div>

          <ul className="ml-4 list-disc">
            {tasks.map((task, i) => (
              <li key={i}>
                <div className="flex items-center gap-2 ml-2 mb-1 text-sm">
                  <span className="text-gray-800">{task}</span>
                  <input
                    className="border px-1 w-20 text-xs"
                    placeholder="Units"
                    value={workUnits[`${locName}_${task}`]}
                    onChange={(e) =>
                      setWorkUnits({ ...workUnits, [`${locName}_${task}`]: e.target.value })
                    }
                  />
                  <input
                    className="border px-1 w-20 text-xs"
                    placeholder="Amount"
                    value={workAmounts[`${locName}_${task}`]}
                    onChange={(e) =>
                      setWorkAmounts({ ...workAmounts, [`${locName}_${task}`]: e.target.value })
                    }
                  />
                  <button
                    onClick={() => updateWork(locName, task)}
                    className="px-2 py-1 text-xs bg-emerald-600 text-white rounded"
                  >
                    Save Work
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
};


  return (
  <div className="bg-white p-6 border rounded shadow max-w-2xl mx-auto">
    <h2 className="text-lg font-bold text-indigo-800 mb-4">📂 Structure Tree with Units & Amounts</h2>

    <button
      onClick={saveAllChanges}
      className="mb-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm rounded"
    >
      💾 Save All Changes
    </button>

    {renderTree()}
  </div>
);

}
