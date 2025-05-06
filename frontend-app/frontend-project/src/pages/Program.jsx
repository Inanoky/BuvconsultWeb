// src/pages/Program.jsx

import React, { useState } from 'react';
import GPTLocation from '../components/GPTLocation';
import LocationPreview from '../components/LocationPreview';
import TreeView from "../ProgramComponents/TreeView.jsx";
import GanttChart from "../ProgramComponents/Ghant.jsx";
import Ghant from "../ProgramComponents/Ghant.jsx";



export default function Program() {
  const [gptResponse, setGptResponse] = useState('');

  const handleGPTResponse = (responseText) => {
    setGptResponse(responseText);
  };

  let parsedData = null;
  try {
    if (gptResponse) {
      parsedData = JSON.parse(gptResponse);
    }
  } catch (error) {
    console.error('Error parsing GPT JSON:', error);
  }

  return (
     <div className="w-full bg-gray-50">
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Ghant/>
      <TreeView/>
      <LocationPreview jsonData={parsedData} />


      {/* GPTLocation renders the raw GPT call */}
      <GPTLocation onResponse={handleGPTResponse} />

      {/* LocationPreview renders the parsed JSON structure */}



   </div>
     </div>

  );
}
