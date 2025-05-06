import React, { useState } from "react";

const AskAssistantAI = () => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    alert(`You asked: ${prompt}`);
    // You can replace this with a real API call to your assistant later.
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-2">Ask Assistant AI</h2>
      <textarea
        className="w-full border border-gray-300 rounded p-2 mb-2"
        rows={4}
        placeholder="Type your question here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Ask
      </button>
    </div>
  );
};

export default AskAssistantAI;
