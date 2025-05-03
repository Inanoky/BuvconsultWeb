

import React from 'react';
import AddWorker from '../components/AddWorker';
import AddLocation from '../components/AddLocation';

export default function ProjectAdmin() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10 bg-white shadow-md rounded-md mt-6">
      <h1 className="text-2xl font-bold text-indigo-700">👷 Project Admin</h1>

      {/* Worker Management */}
      <AddWorker />

      {/* Location Management */}
      <AddLocation />
    </div>
  );
}