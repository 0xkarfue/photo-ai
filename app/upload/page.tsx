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
    <div style={{ padding: 20 }}>
      <h1>Test Upload</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <br />
      <br />

      <button onClick={createSession} style={{ marginRight: 10 }}>
        Create Session
      </button>
      <button onClick={uploadFile}>Upload File</button>

      <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 10 }}>
        {JSON.stringify(response, null, 2)}
      </pre>

      {session && (
        <p>
          Created Session ID: <b>{session.id}</b>
        </p>
      )}

      {response?.fileUrl && (
        <div style={{ marginTop: 20 }}>
          <h3>Uploaded File Preview:</h3>
          {response.upload?.fileType?.startsWith("image/") ? (
            <img
              src={response.fileUrl}
              alt="Uploaded file"
              style={{ maxWidth: "400px", border: "1px solid #ccc" }}
            />
          ) : (
            <a href={response.fileUrl} target="_blank" rel="noreferrer">
              Download File
            </a>
          )}
        </div>
      )}
    </div>
  );
}
