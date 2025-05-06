
import React, { useContext } from 'react';
import AddWorker from '../ProjectAdmin/AddWorker.jsx';
import AddLocation from '../ProjectAdmin/AddLocation.jsx';
import ProjectInfo from '../ProjectAdmin/ProjectInfo.jsx';
import { ProjectContext } from '../utilities/ProjectContext.jsx';

export default function ProjectAdmin() {
    const { project } = useContext(ProjectContext);
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10 bg-white shadow-md rounded-md mt-6">
      <h1 className="text-2xl font-bold text-indigo-700">
                 👷 {project ? `${project.name} Admin` : 'Project Admin'}
      </h1>

      {/* ✅ Project Info Section */}
      <ProjectInfo />

      {/* Worker Management */}
      <AddWorker />

      {/* Location Management */}
      <AddLocation />
    </div>
  );
}