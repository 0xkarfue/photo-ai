'use client'

import { useState } from 'react'

interface ImageUploaderProps {
  onUploadComplete: (uploadId: string) => void
}

export default function ImageUploader({ onUploadComplete }: ImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [faceCount, setFaceCount] = useState(0)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (selectedFiles.length < 5 || selectedFiles.length > 10) {
      setError('Please select 5-10 images')
      return
    }

    setError('')
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
    setFiles(selectedFiles)
  }

  const handleUpload = async () => {
    if (files.length < 5) {
      setError('Please select at least 5 images')
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')

    try {
      const sessionRes = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageCount: files.length })
      })

      const sessionData = await sessionRes.json()
      if (!sessionData.success) throw new Error(sessionData.error.message)

      setProgress(20)

      const formData = new FormData()
      formData.append('uploadId', sessionData.data.uploadId)
      files.forEach(file => formData.append('images', file))

      const uploadRes = await fetch('/api/uploads/images', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadRes.json()
      if (!uploadData.success) throw new Error(uploadData.error.message)

      setProgress(100)
      setFaceCount(uploadData.data.totalFaces)
      onUploadComplete(sessionData.data.uploadId)

      alert(`✅ Upload complete! Detected ${uploadData.data.totalFaces} faces.`)

    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Upload failed')
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
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Upload Your Photos</h2>
      <p className="text-gray-400 mb-4">Upload 5-10 clear photos for best results</p>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg">
          {error}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors mb-4 bg-gray-800/30">
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
          <div className="text-5xl mb-3">📸</div>
          <p className="font-semibold text-lg mb-1 text-white">Click to select photos</p>
          <p className="text-sm text-gray-400">or drag and drop</p>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB each</p>
        </label>
      </div>

      {previews.length > 0 && (
        <div className="mb-4">
          <p className="font-semibold mb-2 text-gray-300">
            Selected: {files.length} images
            {files.length >= 5 && files.length <= 10 && ' ✅'}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {previews.map((preview, idx) => (
              <div key={idx} className="relative aspect-square">
                <img
                  src={preview}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-full object-cover rounded border border-gray-700"
                />
                <button
                  onClick={() => removeFile(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600 transition-colors"
                >
                  ✕
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
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {uploading ? `Uploading... ${progress}%` : 'Upload & Process Images'}
        </button>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-800 rounded-full h-2 border border-gray-700">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {faceCount > 0 && !uploading && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
          <p className="text-green-300 font-semibold">
            ✅ Detected {faceCount} faces in your photos!
          </p>
          <p className="text-sm text-green-400">Ready to generate images</p>
        </div>
      )}
    </div>
  )
}