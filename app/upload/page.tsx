"use client";
import { useState } from "react";
import axios from "axios";

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  const createSession = async () => {
    if (!file) return alert("Choose a file first!");

    try {
      const res = await axios.post(
        "/api/uploads",
        {
          filename: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
        {
          headers: {
            Authorization: "Bearer testtoken",
            "Content-Type": "application/json",
          },
        }
      );
      setSession(res.data.session);
      setResponse(res.data);
    } catch (err: any) {
      setResponse(err.response?.data || err.message);
    }
  };

  const uploadFile = async () => {
    if (!file) return alert("Choose a file first!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/api/uploads", formData, {
        headers: {
          Authorization: "Bearer testtoken",
          "Content-Type": "multipart/form-data",
        },
      });
      setResponse(res.data);
    } catch (err: any) {
      setResponse(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Test Upload</h1>

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Choose a file
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer file:transition-colors border border-gray-700 rounded-lg bg-gray-800 cursor-pointer"
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={createSession}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Session
            </button>
            <button
              onClick={uploadFile}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Upload File
            </button>
          </div>
        </div>

        {session && (
          <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-6">
            <p className="text-green-300">
              Created Session ID: <span className="font-bold">{session.id}</span>
            </p>
          </div>
        )}

        {response && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Response Data</h2>
            <pre className="bg-gray-950 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm border border-gray-800">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {response?.fileUrl && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Uploaded File Preview</h3>
            {response.upload?.fileType?.startsWith("image/") ? (
              <img
                src={response.fileUrl}
                alt="Uploaded file"
                className="max-w-full rounded-lg border border-gray-700"
              />
            ) : (
              <a
                href={response.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                📥 Download File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}