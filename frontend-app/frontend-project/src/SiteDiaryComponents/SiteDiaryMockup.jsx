import React from "react";
import Site_diary from '../assets/Site_diary.png';

const Gant = () => {
  return (
    <div className="flex flex-col items-center p-4 h-screen">
      <h2 className="text-2xl font-bold mb-4">Site diary</h2>
      <iframe
        src={Site_diary}
        className="w-full flex-1 border rounded shadow"
        title="Gantt Chart"
      ></iframe>
    </div>
  );
};

export default Gant;