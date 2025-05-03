import React from 'react';
import SiteDiaryList from "../SiteDiaryComponents/SiteDiaryList.jsx";
import GenerateDiaryButton from "../SiteDiaryComponents/GenerateDiaryButton.jsx";

export default function SiteDiary() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Site Diary</h1>
      <GenerateDiaryButton />
      <SiteDiaryList />
    </div>
  );
}