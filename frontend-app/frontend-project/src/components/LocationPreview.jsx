import React, { useState, useEffect } from 'react';

export default function LocationPreview({ jsonData }) {
  const [tree, setTree] = useState({});
  const [selectedLevel1, setSelectedLevel1] = useState('');
  const [selectedLevel2, setSelectedLevel2] = useState('');
  const [newLevel1, setNewLevel1] = useState('');
  const [newLevel2, setNewLevel2] = useState('');
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (jsonData && typeof jsonData === 'object') {
      setTree(JSON.parse(JSON.stringify(jsonData))); // deep copy
    }
  }, [jsonData]);

  // --- Modify Tree ---

  const addLevel1 = () => {
    if (!newLevel1.trim()) return;
    setTree({ ...tree, [newLevel1]: {} });
    setNewLevel1('');
  };

  const renameLevel1 = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    const newTree = { ...tree };
    newTree[newName] = newTree[oldName];
    delete newTree[oldName];
    setTree(newTree);
    if (selectedLevel1 === oldName) setSelectedLevel1(newName);
  };

  const deleteLevel1 = (name) => {
    const newTree = { ...tree };
    delete newTree[name];
    setTree(newTree);
    if (selectedLevel1 === name) {
      setSelectedLevel1('');
      setSelectedLevel2('');
    }
  };

  const addLevel2 = () => {
    if (!newLevel2.trim() || !selectedLevel1) return;
    const newTree = { ...tree };
    newTree[selectedLevel1][newLevel2] = [];
    setTree(newTree);
    setNewLevel2('');
  };

  const renameLevel2 = (oldName, newName) => {
    if (!newName.trim() || oldName === newName) return;
    const newTree = { ...tree };
    newTree[selectedLevel1][newName] = newTree[selectedLevel1][oldName];
    delete newTree[selectedLevel1][oldName];
    setTree(newTree);
    if (selectedLevel2 === oldName) setSelectedLevel2(newName);
  };

  const deleteLevel2 = (name) => {
    const newTree = { ...tree };
    delete newTree[selectedLevel1][name];
    setTree(newTree);
    if (selectedLevel2 === name) setSelectedLevel2('');
  };

  const addTask = () => {
    if (!newTask.trim() || !selectedLevel1 || !selectedLevel2) return;
    const newTree = { ...tree };
    newTree[selectedLevel1][selectedLevel2].push(newTask);
    setTree(newTree);
    setNewTask('');
  };

  const deleteTask = (task) => {
    const newTree = { ...tree };
    newTree[selectedLevel1][selectedLevel2] = newTree[selectedLevel1][selectedLevel2].filter(
      (t) => t !== task
    );
    setTree(newTree);
  };

  // --- Render ---

  const renderLiveTree = (data, level = 0) => {
    if (typeof data === 'object' && data !== null) {
      return (
        <ul className={`ml-${level * 2} text-sm`}>
          {Object.entries(data).map(([key, value]) => (
            <li key={key}>
              <span className="font-semibold text-indigo-700">{key}</span>
              {Array.isArray(value) ? (
                <ul className="ml-4 list-disc">
                  {value.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              ) : (
                renderLiveTree(value, level + 1)
              )}
            </li>
          ))}
        </ul>
      );
    }
    return null;
  };


  const flattenLocations = (data, parentPath = [], result = []) => {
  if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      const currentPath = [...parentPath, key];
      if (Array.isArray(value)) {
        // Final level with tasks
        result.push(currentPath.join(' - '));
      } else {
        // Continue walking
        flattenLocations(value, currentPath, result);
      }
    }
  }
  return result;
};

  const flattenTasks = (data, parentPath = [], result = []) => {
  if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      const currentPath = [...parentPath, key];
      if (Array.isArray(value)) {
        for (const task of value) {
          result.push({ location_name: currentPath.join(' - '), task });
        }
      } else {
        flattenTasks(value, currentPath, result);
      }
    }
  }
  return result;
};

    const handleSave = async () => {
    const flattenedLocations = flattenLocations(tree);
    const flattenedWorks = flattenTasks(tree);
    let locSuccess = 0, workSuccess = 0;

    // Save locations first
    for (const name of flattenedLocations) {
      try {
        const res = await fetch('http://localhost:8000/api/locations/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        });
        if (res.ok) locSuccess++;
      } catch (err) {
        console.error('❌ Failed to save location:', name, err);
      }
    }

    // Save works next
    for (const { location_name, task } of flattenedWorks) {
      try {
        const res = await fetch('http://localhost:8000/api/works/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location_name, task })
        });
        if (res.ok) workSuccess++;
      } catch (err) {
        console.error('❌ Failed to save work:', location_name, task, err);
      }
    }

+    // Force re-render of the current tree structure after save
+    setTree({ ...tree });

    alert(`✅ Saved ${locSuccess} locations and ${workSuccess} works.`);
  };



  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* Left: Controls */}
      <div className="space-y-4 bg-white p-6 border rounded shadow">
        <h2 className="text-lg font-bold text-indigo-800">📋 Edit Locations</h2>

        {/* Level 1 */}
        <div className="space-y-2">
          <label className="font-semibold">🏠 Location 1 (e.g. House)</label>
          <select
            value={selectedLevel1}
            onChange={(e) => setSelectedLevel1(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="">-- Select --</option>
            {Object.keys(tree).map((key) => (
              <option key={key}>{key}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              value={newLevel1}
              onChange={(e) => setNewLevel1(e.target.value)}
              placeholder="New / Rename"
              className="border p-2 rounded w-full"
            />
            <button onClick={addLevel1} className="bg-green-600 text-white px-3 rounded">➕</button>
            <button onClick={() => renameLevel1(selectedLevel1, newLevel1)} className="bg-yellow-500 text-white px-3 rounded">✏</button>
            <button onClick={() => deleteLevel1(selectedLevel1)} className="bg-red-600 text-white px-3 rounded">🗑</button>
          </div>
        </div>

        {/* Level 2 */}
        {selectedLevel1 && (
          <div className="space-y-2">
            <label className="font-semibold">🏢 Location 2 (e.g. Floor)</label>
            <select
              value={selectedLevel2}
              onChange={(e) => setSelectedLevel2(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="">-- Select --</option>
              {Object.keys(tree[selectedLevel1] || {}).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                value={newLevel2}
                onChange={(e) => setNewLevel2(e.target.value)}
                placeholder="New / Rename"
                className="border p-2 rounded w-full"
              />
              <button onClick={addLevel2} className="bg-green-600 text-white px-3 rounded">➕</button>
              <button onClick={() => renameLevel2(selectedLevel2, newLevel2)} className="bg-yellow-500 text-white px-3 rounded">✏</button>
              <button onClick={() => deleteLevel2(selectedLevel2)} className="bg-red-600 text-white px-3 rounded">🗑</button>
            </div>
          </div>
        )}

        {/* Tasks */}
        {selectedLevel2 && (
          <div className="space-y-2">
            <label className="font-semibold">🛠️ Tasks</label>
            <ul className="list-disc ml-6 text-sm">
              {(tree[selectedLevel1]?.[selectedLevel2] || []).map((task, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{task}</span>
                  <button
                    onClick={() => deleteTask(task)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2 mt-1">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New Task"
                className="border p-2 rounded w-full"
              />
              <button onClick={addTask} className="bg-green-600 text-white px-3 rounded">➕</button>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          💾 Save Structure
        </button>
      </div>

      {/* Right: Live View */}
      <div className="bg-white p-6 border rounded shadow">
        <h2 className="text-lg font-bold text-indigo-800 mb-2">📂 Live Structure View</h2>
        {renderLiveTree(tree)}
      </div>
    </div>
  );
}
