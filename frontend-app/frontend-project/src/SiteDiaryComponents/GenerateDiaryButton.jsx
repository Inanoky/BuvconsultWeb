import React from 'react';
import axios from 'axios';

export default function GenerateDiaryButton({ onComplete }) {
  const generate = () => {
    axios.post('http://localhost:8000/api/site-diary/generate')
      .then(() => {
        alert("Diary generated from attendance!");
        if (onComplete) onComplete();
      })
      .catch(err => alert("Error generating diary"));
  };

  return (
    <button onClick={generate} className="px-4 py-2 bg-green-600 text-white rounded">
      Generate Diary from Attendance
    </button>
  );
}
