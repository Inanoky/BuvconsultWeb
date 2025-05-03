import React from "react";
import Riga_project from '../assets/Riga_project.png'

const Gant = () => {
  return (
    <div className="flex flex-col items-center p-4 h-screen">
      <h2 className="text-2xl font-bold mb-4">Project Gantt Chart</h2>
      <iframe
        src={Riga_project}
        className="w-full flex-1 border rounded shadow"
        title="Gantt Chart"
      ></iframe>
    </div>
  );
};

export default Gant;
