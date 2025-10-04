import Link from "next/link"
import { Camera, Sparkles, Palette, ArrowRight } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="text-center max-w-5xl px-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Camera className="w-12 h-12 text-zinc-400" strokeWidth={1.5} />
          <Sparkles className="w-10 h-10 text-zinc-500" strokeWidth={1.5} />
        </div>

        <h1 className="text-6xl md:text-7xl font-light text-zinc-100 tracking-tight mb-6">Photo AI</h1>

        <p className="text-xl md:text-2xl text-zinc-400 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
          Upload your photos and let AI enhance your prompts to generate stunning, personalized images
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link
            href="/register"
            className="group px-8 py-4 bg-zinc-100 text-zinc-900 rounded-lg text-lg font-medium hover:bg-white transition-all duration-300 flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-zinc-900 text-zinc-100 rounded-lg text-lg font-medium hover:bg-zinc-800 transition-all duration-300 border border-zinc-800 hover:border-zinc-700"
          >
            Login
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="group p-8 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
            <Camera
              className="w-8 h-8 text-zinc-400 mb-4 group-hover:text-zinc-300 transition-colors"
              strokeWidth={1.5}
            />
            <h3 className="text-lg font-medium mb-2 text-zinc-100">Upload Photos</h3>
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              Upload 5-10 photos to train your personalized AI model
            </p>
          </div>

          <div className="group p-8 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
            <Sparkles
              className="w-8 h-8 text-zinc-400 mb-4 group-hover:text-zinc-300 transition-colors"
              strokeWidth={1.5}
            />
            <h3 className="text-lg font-medium mb-2 text-zinc-100">AI Enhancement</h3>
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              Advanced AI enhances your prompts for optimal results
            </p>
          </div>

          <div className="group p-8 bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
            <Palette
              className="w-8 h-8 text-zinc-400 mb-4 group-hover:text-zinc-300 transition-colors"
              strokeWidth={1.5}
            />
            <h3 className="text-lg font-medium mb-2 text-zinc-100">Generate Images</h3>
            <p className="text-sm text-zinc-500 font-light leading-relaxed">
              Create stunning, personalized AI-generated photos
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
