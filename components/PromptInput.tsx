"use client"
import { useState } from "react"
import { Sparkles, Wand2, Check, X, Lightbulb } from "lucide-react"

interface PromptInputProps {
  uploadId: string | null
  onGenerateStart: (jobId: string) => void
}

export default function PromptInput({ uploadId, onGenerateStart }: PromptInputProps) {
  const [prompt, setPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showEnhanced, setShowEnhanced] = useState(false)
  const [llamaInfo, setLlamaInfo] = useState<any>(null)

  const handleEnhance = async () => {
    if (!prompt.trim()) return

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/generation/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const data = await response.json()
      if (data.success) {
        setEnhancedPrompt(data.data.enhancedPrompt)
        setLlamaInfo({
          model: data.data.model,
          provider: data.data.provider,
          improvements: data.data.improvements,
        })
        setShowEnhanced(true)
      } else {
        alert(data.error.message)
      }
    } catch (error) {
      console.error("Enhancement error:", error)
      alert("Failed to enhance prompt")
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleGenerate = async () => {
    if (!uploadId) {
      alert("Please upload images first!")
      return
    }

    if (!prompt.trim()) {
      alert("Please enter a prompt!")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadId,
          prompt: prompt.trim(),
          enhancedPrompt: enhancedPrompt || undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        onGenerateStart(data.data.jobId)
      } else {
        alert(data.error.message)
      }
    } catch (error) {
      console.error("Generation error:", error)
      alert("Failed to start generation")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 p-8 shadow-2xl">
      <h2 className="text-2xl font-light mb-8 text-zinc-100 tracking-tight">Create Your Vision</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-3 text-zinc-400">Describe your image</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A serene beach at sunset with golden light reflecting on the water..."
          className="w-full px-4 py-4 bg-zinc-950/50 border border-zinc-800 text-zinc-100 placeholder-zinc-600 rounded-xl focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 min-h-[120px] outline-none transition-all resize-none"
          maxLength={500}
        />
        <div className="text-xs text-zinc-600 mt-2">{prompt.length}/500</div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={handleEnhance}
          disabled={!prompt.trim() || isEnhancing}
          className="flex-1 py-3.5 px-4 bg-zinc-800 text-zinc-100 rounded-xl hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2 group"
        >
          <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          {isEnhancing ? "Enhancing..." : "Enhance Prompt"}
        </button>
        <button
          onClick={handleGenerate}
          disabled={!uploadId || !prompt.trim() || isGenerating}
          className="flex-1 py-3.5 px-4 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2 group"
        >
          <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {isGenerating ? "Generating..." : "Generate Image"}
        </button>
      </div>

      {showEnhanced && enhancedPrompt && (
        <div className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/80 backdrop-blur-sm mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-zinc-400" />
              <h3 className="font-medium text-zinc-300">
                Enhanced Prompt
                {llamaInfo && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md ml-2 font-normal">
                    {llamaInfo.model}
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={() => setShowEnhanced(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Original</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{prompt}</p>
            </div>

            <div>
              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Enhanced</p>
              <p className="text-sm text-zinc-100 leading-relaxed font-medium">{enhancedPrompt}</p>
            </div>

            {llamaInfo?.improvements && (
              <div>
                <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Improvements</p>
                <ul className="text-xs text-zinc-400 space-y-2">
                  {llamaInfo.improvements.map((imp: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-zinc-600 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPrompt(enhancedPrompt)}
                className="text-sm px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg hover:bg-white transition-all font-medium"
              >
                Use Enhanced
              </button>
              <button
                onClick={() => setShowEnhanced(false)}
                className="text-sm px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-750 transition-all"
              >
                Keep Original
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-zinc-500 mt-6 bg-zinc-950/30 rounded-xl p-4 border border-zinc-800/30">
        <div className="flex items-start gap-2 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-zinc-600 mt-0.5 flex-shrink-0" />
          <p className="font-medium text-zinc-400">Tips for better results</p>
        </div>
        <ul className="space-y-1.5 ml-5 text-zinc-600">
          <li>Be specific about scene details and atmosphere</li>
          <li>Use the enhance feature for professional quality</li>
          <li>Describe lighting, mood, and artistic style</li>
        </ul>
      </div>
    </div>
  )
}
