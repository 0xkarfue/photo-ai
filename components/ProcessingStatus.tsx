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
    return <div className="text-center p-8">Loading status...</div>
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
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Generation Status</h2>

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)} animate-pulse`} />
        <span className="font-semibold text-lg">{status.status}</span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>{status.message}</span>
          <span className="font-semibold">{status.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      </div>

      {status.currentStep && (
        <div className="p-3 bg-blue-50 rounded mb-4">
          <span className="font-medium capitalize">
            Current Step: {status.currentStep.replace('-', ' ')}
          </span>
        </div>
      )}

      {status.estimatedTimeRemaining > 0 && (
        <p className="text-sm text-gray-600">
          ⏱️ Estimated time: {status.estimatedTimeRemaining} seconds
        </p>
      )}

      {status.status === 'COMPLETED' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold text-lg">
            🎉 Generation Complete!
          </p>
          <p className="text-sm text-green-700">Your image is ready below</p>
        </div>
      )}

      {status.status === 'FAILED' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-semibold">❌ Generation Failed</p>
          <p className="text-sm text-red-700">{status.error || 'Please try again'}</p>
        </div>
      )}
    </div>
  )
}











// 'use client'

// import { useState } from 'react'

// interface PromptInputProps {
//   uploadId: string | null
//   onGenerateStart: (jobId: string) => void
// }

// export default function PromptInput({ uploadId, onGenerateStart }: PromptInputProps) {
//   const [prompt, setPrompt] = useState('')
//   const [enhancedPrompt, setEnhancedPrompt] = useState('')
//   const [isEnhancing, setIsEnhancing] = useState(false)
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [showEnhanced, setShowEnhanced] = useState(false)
//   const [llamaInfo, setLlamaInfo] = useState<any>(null)

//   const handleEnhance = async () => {
//     if (!prompt.trim()) return

//     setIsEnhancing(true)
//     try {
//       const response = await fetch('/api/generation/enhance-prompt', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: prompt.trim() })
//       })

//       const data = await response.json()
      
//       if (data.success) {
//         setEnhancedPrompt(data.data.enhancedPrompt)
//         setLlamaInfo({
//           model: data.data.model,
//           provider: data.data.provider,
//           improvements: data.data.improvements
//         })
//         setShowEnhanced(true)
//       } else {
//         alert(data.error.message)
//       }
//     } catch (error) {
//       console.error('Enhancement error:', error)
//       alert('Failed to enhance prompt')
//     } finally {
//       setIsEnhancing(false)
//     }
//   }

//   const handleGenerate = async () => {
//     if (!uploadId) {
//       alert('Please upload images first!')
//       return
//     }

//     if (!prompt.trim()) {
//       alert('Please enter a prompt!')
//       return
//     }

//     setIsGenerating(true)
//     try {
//       const response = await fetch('/api/generation/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           uploadId,
//           prompt: prompt.trim(),
//           enhancedPrompt: enhancedPrompt || undefined
//         })
//       })

//       const data = await response.json()
      
//       if (data.success) {
//         onGenerateStart(data.data.jobId)
//       } else {
//         alert(data.error.message)
//       }
//     } catch (error) {
//       console.error('Generation error:', error)
//       alert('Failed to start generation')
//     } finally {
//       setIsGenerating(false)
//     }
//   }

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-2xl font-bold mb-4">Generate Your Image</h2>

//       <div className="mb-4">
//         <label className="block text-sm font-medium mb-2">
//           Describe your image
//         </label>
//         <textarea
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="e.g., me on a beach watching sunset"
//           className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px] outline-none"
//           maxLength={500}
//         />
//         <div className="text-sm text-gray-500 mt-1">
//           {prompt.length}/500 characters
//         </div>
//       </div>

//       <div className="flex gap-3 mb-4">
//         <button
//           onClick={handleEnhance}
//           disabled={!prompt.trim() || isEnhancing}
//           className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
//         >
//           {isEnhancing ? '⚡ Enhancing...' : '🦙 Enhance with Meta LLaMA'}
//         </button>

//         <button
//           onClick={handleGenerate}
//           disabled={!uploadId || !prompt.trim() || isGenerating}
//           className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
//         >
//           {isGenerating ? 'Generating...' : 'Generate Image'}
//         </button>
//       </div>

//       {showEnhanced && enhancedPrompt && (
//         <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
//           <div className="flex items-start justify-between mb-2">
//             <h3 className="font-semibold text-purple-900">
//               🦙 Meta LLaMA Enhanced
//               {llamaInfo && (
//                 <span className="text-xs bg-purple-200 px-2 py-1 rounded ml-2">
//                   {llamaInfo.model}
//                 </span>
//               )}
//             </h3>
//             <button
//               onClick={() => setShowEnhanced(false)}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               ✕
//             </button>
//           </div>

//           <div className="space-y-3">
//             <div>
//               <p className="text-xs text-gray-600 mb-1">Your prompt:</p>
//               <p className="text-sm text-gray-800">{prompt}</p>
//             </div>

//             <div>
//               <p className="text-xs text-purple-600 mb-1">Meta LLaMA enhanced:</p>
//               <p className="text-sm text-gray-900 font-medium">{enhancedPrompt}</p>
//             </div>

//             {llamaInfo?.improvements && (
//               <div>
//                 <p className="text-xs text-gray-600 mb-1">Improvements:</p>
//                 <ul className="text-xs text-gray-700 space-y-1">
//                   {llamaInfo.improvements.map((imp: string, idx: number) => (
//                     <li key={idx} className="flex items-start gap-2">
//                       <span className="text-green-600">✓</span>
//                       <span>{imp}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <div className="flex gap-2 pt-2">
//               <button
//                 onClick={() => setPrompt(enhancedPrompt)}
//                 className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
//               >
//                 Use Enhanced
//               </button>
//               <button
//                 onClick={() => setShowEnhanced(false)}
//                 className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
//               >
//                 Keep Original
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="text-xs text-gray-500 mt-4">
//         <p className="font-semibold mb-1">💡 Tips:</p>
//         <ul className="list-disc list-inside space-y-1 ml-2">
//           <li>Be specific about the scene and setting</li>
//           <li>Use Meta LLaMA enhance for professional results</li>
//           <li>Mention lighting, mood, or style you want</li>
//         </ul>
//       </div>
//     </div>
//   )
// }