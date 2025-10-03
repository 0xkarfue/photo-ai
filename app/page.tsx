import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      <div className="text-center max-w-4xl px-6">
        <div className="text-6xl mb-6">🦙📸</div>
        
        <h1 className="text-5xl font-bold mb-4 text-white">Photo AI</h1>
        
        <p className="text-xl text-gray-300 mb-8">
          Upload your photos and let Meta LLaMA enhance your prompts to generate stunning AI images
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-gray-800 text-gray-200 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
          >
            Login
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="font-bold mb-2 text-white">Upload Photos</h3>
            <p className="text-sm text-gray-400">Upload 5-10 photos of yourself</p>
          </div>
          
          <div className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800">
            <div className="text-3xl mb-3">🦙</div>
            <h3 className="font-bold mb-2 text-white">AI Enhancement</h3>
            <p className="text-sm text-gray-400">Meta LLaMA enhances your prompts</p>
          </div>
          
          <div className="p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-bold mb-2 text-white">Generate Images</h3>
            <p className="text-sm text-gray-400">Get amazing AI-generated photos</p>
          </div>
        </div>
      </div>
    </div>
  )
}