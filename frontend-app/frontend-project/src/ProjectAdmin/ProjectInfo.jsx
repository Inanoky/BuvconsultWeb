// src/ProjectAdmin/ProjectInfo.jsx
import { useContext } from 'react';
import { ProjectContext } from '../utilities/ProjectContext.jsx';

export default function ProjectInfo() {
  const { project } = useContext(ProjectContext);

  if (!project) {
    return (
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        ⚠️ No project selected. Please go back and select a project.
      </div>
    );
  }

  // Mockup dates
  const startDate = "2025-05-01";
  const finishDate = "2025-12-31";

  return (
    <div className="space-y-2 border p-4 rounded bg-indigo-50 border-indigo-200">
      <h2 className="text-lg font-semibold text-indigo-800">🏗 Project Info</h2>
      <div><span className="font-medium">Name:</span> {project.name}</div>
      <div><span className="font-medium">Address:</span> {project.address}</div>
      <div><span className="font-medium">Start Date:</span> {startDate}</div>
      <div><span className="font-medium">Planned Finish:</span> {finishDate}</div>
    </div>
  );
}
