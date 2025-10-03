'use client'
import { useState } from 'react'

interface PromptInputProps {
  uploadId: string | null
  onGenerateStart: (jobId: string) => void
}

export default function PromptInput({ uploadId, onGenerateStart }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showEnhanced, setShowEnhanced] = useState(false)
  const [llamaInfo, setLlamaInfo] = useState<any>(null)

  const handleEnhance = async () => {
    if (!prompt.trim()) return

    setIsEnhancing(true)
    try {
      const response = await fetch('/api/generation/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      })

      const data = await response.json()
      if (data.success) {
        setEnhancedPrompt(data.data.enhancedPrompt)
        setLlamaInfo({
          model: data.data.model,
          provider: data.data.provider,
          improvements: data.data.improvements
        })
        setShowEnhanced(true)
      } else {
        alert(data.error.message)
      }
    } catch (error) {
      console.error('Enhancement error:', error)
      alert('Failed to enhance prompt')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleGenerate = async () => {
    if (!uploadId) {
      alert('Please upload images first!')
      return
    }

    if (!prompt.trim()) {
      alert('Please enter a prompt!')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          prompt: prompt.trim(),
          enhancedPrompt: enhancedPrompt || undefined
        })
      })

      const data = await response.json()
      if (data.success) {
        onGenerateStart(data.data.jobId)
      } else {
        alert(data.error.message)
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to start generation')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Generate Your Image</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Describe your image
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., me on a beach watching sunset"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] outline-none transition-all"
          maxLength={500}
        />
        <div className="text-sm text-gray-500 mt-1">
          {prompt.length}/500 characters
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          onClick={handleEnhance}
          disabled={!prompt.trim() || isEnhancing}
          className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {isEnhancing ? '⚡ Enhancing...' : '🦙 Enhance with Meta LLaMA'}
        </button>
        <button
          onClick={handleGenerate}
          disabled={!uploadId || !prompt.trim() || isGenerating}
          className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {showEnhanced && enhancedPrompt && (
        <div className="border border-purple-500/30 rounded-lg p-4 bg-purple-900/20 backdrop-blur-sm mb-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-purple-300">
              🦙 Meta LLaMA Enhanced
              {llamaInfo && (
                <span className="text-xs bg-purple-600/50 px-2 py-1 rounded ml-2">
                  {llamaInfo.model}
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowEnhanced(false)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-1">Your prompt:</p>
              <p className="text-sm text-gray-300">{prompt}</p>
            </div>
            
            <div>
              <p className="text-xs text-purple-400 mb-1">Meta LLaMA enhanced:</p>
              <p className="text-sm text-white font-medium">{enhancedPrompt}</p>
            </div>
            
            {llamaInfo?.improvements && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Improvements:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  {llamaInfo.improvements.map((imp: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPrompt(enhancedPrompt)}
                className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Use Enhanced
              </button>
              <button
                onClick={() => setShowEnhanced(false)}
                className="text-sm px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                Keep Original
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 mt-4 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
        <p className="font-semibold mb-2 text-gray-300">💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Be specific about the scene and setting</li>
          <li>Use Meta LLaMA enhance for professional results</li>
          <li>Mention lighting, mood, or style you want</li>
        </ul>
      </div>
    </div>
  )
}