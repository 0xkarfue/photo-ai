"use client"
import { useEffect, useState } from "react"
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface ProcessingStatusProps {
  jobId: string
  onComplete?: (resultId: string) => void
}

export default function ProcessingStatus({ jobId, onComplete }: ProcessingStatusProps) {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!jobId) return

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/generation/status?jobId=${jobId}`)
        const data = await response.json()

        if (data.success) {
          setStatus(data.data)

          if (data.data.status === "COMPLETED" && data.data.resultId) {
            onComplete?.(data.data.resultId)
          }

          if (data.data.status !== "COMPLETED" && data.data.status !== "FAILED") {
            setTimeout(pollStatus, 2000)
          }
        }
      } catch (error) {
        console.error("Status poll error:", error)
      } finally {
        setLoading(false)
      }
    }

    pollStatus()
  }, [jobId, onComplete])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    )
  }

  if (!status) return null

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      QUEUED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      PROCESSING: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      FAILED: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return colors[status] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "QUEUED":
        return <Clock className="w-4 h-4" />
      case "PROCESSING":
        return <Loader2 className="w-4 h-4 animate-spin" />
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4" />
      case "FAILED":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-8">
      <h2 className="text-xl font-light mb-8 text-zinc-100">Generation Progress</h2>

      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(status.status)}`}>
          {getStatusIcon(status.status)}
          <span className="text-sm font-medium">{status.status}</span>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-sm text-zinc-400 font-light">{status.message}</span>
          <span className="text-sm font-medium text-zinc-300">{status.progress}%</span>
        </div>
        <div className="w-full bg-zinc-800/50 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-violet-500 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      </div>

      {status.currentStep && (
        <div className="px-4 py-3 bg-zinc-800/30 rounded-xl mb-6 border border-zinc-700/30">
          <span className="text-sm font-light text-zinc-300">
            {status.currentStep.replace("-", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
          </span>
        </div>
      )}

      {status.estimatedTimeRemaining > 0 && (
        <div className="flex items-center gap-2 text-sm text-zinc-400 font-light">
          <Clock className="w-4 h-4" />
          <span>Estimated time: {status.estimatedTimeRemaining}s</span>
        </div>
      )}

      {status.status === "COMPLETED" && (
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-300 font-medium">Generation Complete</p>
          </div>
          <p className="text-sm text-emerald-400/70 font-light ml-7">Your image is ready to view</p>
        </div>
      )}

      {status.status === "FAILED" && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300 font-medium">Generation Failed</p>
          </div>
          <p className="text-sm text-red-400/70 font-light ml-7">{status.error || "Please try again"}</p>
        </div>
      )}
    </div>
  )
}
