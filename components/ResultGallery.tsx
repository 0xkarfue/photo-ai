"use client"
import { useEffect, useState } from "react"
import { Download, Share2, ImageIcon, Clock, Users, Sparkles } from "lucide-react"

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
        console.error("Result fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [resultId])

  if (!resultId && !result) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-xl rounded-2xl p-12 text-center border border-zinc-800/50">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/5 to-transparent" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-800/50 mb-6">
            <ImageIcon className="w-10 h-10 text-zinc-500" strokeWidth={1.5} />
          </div>
          <p className="text-zinc-400 text-lg font-light">Your creation will appear here</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-8">
        <div className="animate-pulse space-y-6">
          <div className="bg-zinc-800/30 h-96 rounded-xl" />
          <div className="space-y-3">
            <div className="bg-zinc-800/30 h-3 w-3/4 rounded-full" />
            <div className="bg-zinc-800/30 h-3 w-1/2 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!result) return null

  const handleDownload = () => {
    window.open(`/api/results/download?resultId=${resultId}&filename=generated-image`, "_blank")
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-xl rounded-2xl border border-zinc-800/50 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800/50">
          <Sparkles className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-light text-zinc-100 tracking-tight">Generated Result</h2>
      </div>

      <div className="mb-8 group">
        <div className="relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30">
          <img
            src={result.image.base64 || "/placeholder.svg"}
            alt="Generated artwork"
            className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {result.metadata && (
        <div className="p-6 bg-zinc-900/30 rounded-xl space-y-4 mb-8 border border-zinc-800/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-zinc-500 font-medium mb-1">Prompt</p>
              <p className="text-zinc-300 text-sm leading-relaxed font-light">{result.metadata.originalPrompt}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/50">
                <Users className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Faces Swapped</p>
                <p className="text-zinc-200 text-sm font-light">{result.metadata.facesSwapped}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/50">
                <Clock className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Processing Time</p>
                <p className="text-zinc-200 text-sm font-light">{result.metadata.processingTime}s</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 group relative overflow-hidden py-3.5 px-6 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-zinc-100/10"
        >
          <span className="relative flex items-center justify-center gap-2">
            <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" strokeWidth={2} />
            Download
          </span>
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="py-3.5 px-6 bg-zinc-800/50 text-zinc-300 rounded-xl hover:bg-zinc-800 transition-all duration-300 border border-zinc-700/50 hover:border-zinc-600 group"
        >
          <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
