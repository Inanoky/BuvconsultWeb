import React from 'react';
import SiteDiaryList from "../SiteDiaryComponents/SiteDiaryList.jsx";
import GenerateDiaryButton from "../SiteDiaryComponents/GenerateDiaryButton.jsx";
import SiteDiaryMockup from "../SiteDiaryComponents/SiteDiaryMockup.jsx";
import AskAssistantAI from "../utilities/AskAssistantAI.jsx";
export default function SiteDiary() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Site Diary</h1>
        <SiteDiaryMockup/>
        <AskAssistantAI/>

    </div>
  );
}