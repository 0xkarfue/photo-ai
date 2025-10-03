'use client'
import { useEffect, useState } from 'react'

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

          if (data.data.status === 'COMPLETED' && data.data.resultId) {
            onComplete?.(data.data.resultId)
          }

          if (data.data.status !== 'COMPLETED' && data.data.status !== 'FAILED') {
            setTimeout(pollStatus, 2000)
          }
        }
      } catch (error) {
        console.error('Status poll error:', error)
      } finally {
        setLoading(false)
      }
    }

    pollStatus()
  }, [jobId, onComplete])

  if (loading) {
    return (
      <div className="text-center p-8 text-gray-400">
        Loading status...
      </div>
    )
  }

  if (!status) return null

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      QUEUED: 'bg-yellow-500',
      PROCESSING: 'bg-blue-500',
      COMPLETED: 'bg-green-500',
      FAILED: 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Generation Status</h2>
      
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)} animate-pulse`} />
        <span className="font-semibold text-lg text-white">{status.status}</span>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-300">{status.message}</span>
          <span className="font-semibold text-white">{status.progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-gray-700">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      </div>

      {status.currentStep && (
        <div className="p-3 bg-blue-900/30 rounded-lg mb-4 border border-blue-700/50">
          <span className="font-medium capitalize text-blue-300">
            Current Step: {status.currentStep.replace('-', ' ')}
          </span>
        </div>
      )}

      {status.estimatedTimeRemaining > 0 && (
        <p className="text-sm text-gray-400">
          ⏱️ Estimated time: {status.estimatedTimeRemaining} seconds
        </p>
      )}

      {status.status === 'COMPLETED' && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-700/50 rounded-lg">
          <p className="text-green-300 font-semibold text-lg">
            🎉 Generation Complete!
          </p>
          <p className="text-sm text-green-400">Your image is ready below</p>
        </div>
      )}

      {status.status === 'FAILED' && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
          <p className="text-red-300 font-semibold">❌ Generation Failed</p>
          <p className="text-sm text-red-400">{status.error || 'Please try again'}</p>
        </div>
      )}
    </div>
  )
}