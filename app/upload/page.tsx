"use client"
import { useState } from "react"
import axios from "axios"
import { Upload, FileCheck, Download, CheckCircle2 } from "lucide-react"

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [response, setResponse] = useState<any>(null)
  const [session, setSession] = useState<any>(null)

  const createSession = async () => {
    if (!file) return alert("Choose a file first!")

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
        },
      )
      setSession(res.data.session)
      setResponse(res.data)
    } catch (err: any) {
      setResponse(err.response?.data || err.message)
    }
  }

  const uploadFile = async () => {
    if (!file) return alert("Choose a file first!")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post("/api/uploads", formData, {
        headers: {
          Authorization: "Bearer testtoken",
          "Content-Type": "multipart/form-data",
        },
      })
      setResponse(res.data)
    } catch (err: any) {
      setResponse(err.response?.data || err.message)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-zinc-100 mb-2">Upload Testing</h1>
          <p className="text-zinc-500 text-sm">Test file upload and session creation</p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-8 mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-4">Select File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-zinc-400 
              file:mr-4 file:py-2.5 file:px-5 
              file:rounded-xl file:border-0 
              file:text-sm file:font-medium 
              file:bg-zinc-800 file:text-zinc-300 
              hover:file:bg-zinc-700 
              file:cursor-pointer file:transition-all
              border border-zinc-800 rounded-xl 
              bg-zinc-900/50 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-zinc-700"
          />

          <div className="flex gap-3 mt-8">
            <button
              onClick={createSession}
              className="flex-1 py-3 px-4 bg-zinc-800 text-zinc-100 rounded-xl font-medium hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 group"
            >
              <FileCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Create Session
            </button>
            <button
              onClick={uploadFile}
              className="flex-1 py-3 px-4 bg-zinc-100 text-zinc-900 rounded-xl font-medium hover:bg-white transition-all flex items-center justify-center gap-2 group"
            >
              <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Upload File
            </button>
          </div>
        </div>

        {session && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300 text-sm">
              Session created: <span className="font-mono font-medium">{session.id}</span>
            </p>
          </div>
        )}

        {response && (
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-8 mb-6">
            <h2 className="text-xl font-light text-zinc-100 mb-4">Response Data</h2>
            <pre className="bg-zinc-950 text-zinc-400 p-6 rounded-xl overflow-x-auto text-xs border border-zinc-800/50 font-mono leading-relaxed">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        {response?.fileUrl && (
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-8">
            <h3 className="text-xl font-light text-zinc-100 mb-6">File Preview</h3>
            {response.upload?.fileType?.startsWith("image/") ? (
              <img
                src={response.fileUrl || "/placeholder.svg"}
                alt="Uploaded file"
                className="max-w-full rounded-xl border border-zinc-800/50"
              />
            ) : (
              <a
                href={response.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-100 rounded-xl hover:bg-zinc-700 transition-all font-medium group"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Download File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
