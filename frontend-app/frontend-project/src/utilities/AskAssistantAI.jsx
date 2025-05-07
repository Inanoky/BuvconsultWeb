import React, { useState } from "react";
import ReactMarkdown from "react-markdown";


export default function AskAssistantAi(){

  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("")

  const handleSubmit = async () => {
    alert(`You asked: ${prompt}`);
    const formData = new FormData();
    formData.append("prompt", prompt);
    // You can replace this with a real API call to your assistant later.


      try {
      const res = await fetch("http://localhost:8000/api/AiAssistant/AskAi", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.response) {
        setResponse(data.response);

      } else {
        setResponse("❌ Error: " + (data.error || "Unknown error"));

      }
    } catch (err) {
      setResponse("❌ Exception: " + err.message);

    }
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
        {response && (
        <div className="mt-4">
          <ReactMarkdown>{response}</ReactMarkdown>
        </div>
      )}
    </div>
  );

}

