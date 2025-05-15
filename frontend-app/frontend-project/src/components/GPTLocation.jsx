import React, { useState } from "react";

export default function GPTLocation({ onResponse }) {
  const [prompt, setPrompt] = useState(
    "This is a construction schedule. Return the location-task hierarchy as structured JSON. Focus on location and task names. Make sure spelling is 100% correct. Be accurate, do not extract info if it doesn't exist in the image. Do not extract dates and durations. Return a clean JSON. Do not include any commentary before or after the JSON response."
  );
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      setResponse("❌ Please select an image file first.");
      return;
    }

    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("file", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gpt-image-parse-base64`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.response) {
        setResponse(data.response);
        onResponse && onResponse(data.response);
      } else {
        setResponse("❌ Error: " + (data.error || "Unknown error"));
        onResponse && onResponse("");
      }
    } catch (err) {
      setResponse("❌ Exception: " + err.message);
      onResponse && onResponse("");
    }
  };

  return (
    <div className="w-full bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg w-full p-6 space-y-6">
          <h1 className="text-xl md:text-2xl font-bold text-indigo-700">
            Upload your construction schedule here
          </h1>

          <div>
            <label className="block font-semibold text-indigo-800">
              🖼️ Upload Image (PNG/JPG):
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-indigo-300 p-2 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="text-sm text-indigo-600 underline mb-2"
            >
              {showPrompt ? "Hide Settings" : "Show Settings"}
            </button>

            {showPrompt && (
              <>
                <label className="block font-semibold text-indigo-800">
                  📝 Prompt:
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border border-indigo-300 p-2 rounded mt-1 focus:ring-2 focus:ring-indigo-500"
                  rows={6}
                />
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200 w-full sm:w-auto"
          >
            ▶️ Analyze Program
          </button>

          {response && (
            <div className="mt-4 border border-indigo-200 p-4 rounded bg-indigo-50">
              <h2 className="font-semibold mb-2 text-indigo-800">🧠 GPT Response:</h2>
              <pre className="whitespace-pre-wrap break-words text-sm text-indigo-900">
                {response}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
