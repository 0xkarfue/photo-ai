"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Camera, X, CheckCircle2, AlertCircle } from "lucide-react"

interface ImageUploaderProps {
  onUploadComplete: (uploadId: string) => void
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [faceCount, setFaceCount] = useState(0)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (selectedFiles.length < 5 || selectedFiles.length > 10) {
      setError("Please select 5-10 images")
      return
    }

    setError("")
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)
    setFiles(selectedFiles)
  }

  const handleUpload = async () => {
    if (files.length < 5) {
      setError("Please select at least 5 images")
      return
    }

    setUploading(true)
    setProgress(0)
    setError("")

    try {
      const sessionRes = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageCount: files.length }),
      })

      const sessionData = await sessionRes.json()
      if (!sessionData.success) throw new Error(sessionData.error.message)

      setProgress(20)

      const formData = new FormData()
      formData.append("uploadId", sessionData.data.uploadId)
      files.forEach((file) => formData.append("images", file))

      const uploadRes = await fetch("/api/uploads/images", {
        method: "POST",
        body: formData,
      })

      const uploadData = await uploadRes.json()
      if (!uploadData.success) throw new Error(uploadData.error.message)

      setProgress(100)
      setFaceCount(uploadData.data.totalFaces)
      onUploadComplete(sessionData.data.uploadId)

      alert(`Upload complete! Detected ${uploadData.data.totalFaces} faces.`)
    } catch (error: any) {
      console.error("Upload error:", error)
      setError(error.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-zinc-100 mb-2">Upload Your Photos</h2>
        <p className="text-sm text-zinc-400">Select 5-10 clear photos for optimal results</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="border-2 border-dashed border-zinc-700/50 rounded-xl p-12 text-center hover:border-zinc-600 hover:bg-zinc-800/30 transition-all duration-300 mb-6 group cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-zinc-800/50 rounded-full group-hover:bg-zinc-700/50 transition-colors">
              <Upload className="w-8 h-8 text-zinc-400 group-hover:text-zinc-300 transition-colors" />
            </div>
          </div>
          <p className="font-medium text-base mb-1 text-zinc-200">Click to select photos</p>
          <p className="text-sm text-zinc-400 mb-3">or drag and drop</p>
          <p className="text-xs text-zinc-500">PNG, JPG up to 10MB each</p>
        </label>
      </div>

      {previews.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-4 h-4 text-zinc-400" />
            <p className="font-medium text-sm text-zinc-300">
              {files.length} {files.length === 1 ? "image" : "images"} selected
            </p>
            {files.length >= 5 && files.length <= 10 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <div className="grid grid-cols-5 gap-3">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square group">
                <img
                  src={preview || "/placeholder.svg"}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-zinc-800"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length >= 5 && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-3.5 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 hover:shadow-lg hover:shadow-zinc-100/10"
        >
          {uploading ? `Uploading... ${progress}%` : "Upload & Process Images"}
        </button>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-zinc-400 to-zinc-200 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {faceCount > 0 && !uploading && (
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-300">
              Detected {faceCount} {faceCount === 1 ? "face" : "faces"} in your photos
            </p>
            <p className="text-xs text-emerald-400/80 mt-1">Ready to generate images</p>
          </div>
        </div>
      )}
    </div>
  )
}
