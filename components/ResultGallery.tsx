'use client'
import { useEffect, useState } from 'react'

interface ResultGalleryProps {
  resultId?: string
}

export default function ResultGallery({ resultId }: ResultGalleryProps) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!resultId) return

    const fetchResult = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/results/${resultId}?include=metadata`)
        const data = await response.json()
        if (data.success) {
          setResult(data.data.result)
        }
      } catch (error) {
        console.error('Result fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [resultId])

  if (!resultId && !result) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-800">
        <div className="text-6xl mb-4">🎨</div>
        <p className="text-gray-400">Your generated images will appear here</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-800 h-64 rounded-lg" />
          <div className="bg-gray-800 h-4 w-3/4 rounded" />
        </div>
      </div>
    )
  }

  if (!result) return null

  const handleDownload = () => {
    window.open(`/api/results/download?resultId=${resultId}&filename=generated-image`, '_blank')
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Your Generated Image</h2>
      
      <div className="mb-6">
        <img
          src={result.image.base64}
          alt="Generated"
          className="w-full rounded-lg border border-gray-800"
        />
      </div>

      {result.metadata && (
        <div className="p-4 bg-gray-800/50 rounded-lg space-y-2 text-sm mb-6 border border-gray-700">
          <p className="text-gray-300">
            <span className="font-semibold text-white">Prompt:</span> {result.metadata.originalPrompt}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-white">Faces Swapped:</span> {result.metadata.facesSwapped}
          </p>
          <p className="text-gray-300">
            <span className="font-semibold text-white">Processing Time:</span> {result.metadata.processingTime}s
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          📥 Download Image
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="py-3 px-6 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
        >
          🔗 Share
        </button>
      </div>
    </div>
  )
}