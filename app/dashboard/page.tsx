"use client"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import ImageUploader from "@/components/ImageUploader"
import PromptInput from "@/components/PromptInput"
import ProcessingStatus from "@/components/ProcessingStatus"
import ResultGallery from "@/components/ResultGallery"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleUploadComplete = (newUploadId: string) => {
    setUploadId(newUploadId)
    setJobId(null)
    setResultId(null)
  }

  const handleGenerateStart = (newJobId: string) => {
    setJobId(newJobId)
    setResultId(null)
  }

  const handleGenerationComplete = (newResultId: string) => {
    setResultId(newResultId)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-zinc-400">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Studio AI</h1>
                  <p className="text-xs text-zinc-500">Creative workspace</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="w-7 h-7 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-zinc-300">{session?.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-3 text-balance">Welcome back, {session?.user?.name}</h2>
          <p className="text-zinc-400 text-lg">Transform your ideas into stunning visuals with AI-powered generation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <ImageUploader onUploadComplete={handleUploadComplete} />
            <PromptInput uploadId={uploadId} onGenerateStart={handleGenerateStart} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {jobId && <ProcessingStatus jobId={jobId} onComplete={handleGenerationComplete} />}
            {resultId && <ResultGallery resultId={resultId} />}
          </div>
        </div>
      </main>
    </div>
  )
}


// 'use client'
// import { useState, useEffect } from 'react'
// import { useSession, signOut } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import ImageUploader from '@/components/ImageUploader'
// import PromptInput from '@/components/PromptInput'
// import ProcessingStatus from '@/components/ProcessingStatus'
// import ResultGallery from '@/components/ResultGallery'

// export default function DashboardPage() {
//   const { data: session, status } = useSession()
//   const router = useRouter()
//   const [uploadId, setUploadId] = useState<string | null>(null)
//   const [jobId, setJobId] = useState<string | null>(null)
//   const [resultId, setResultId] = useState<string | null>(null)

//   useEffect(() => {
//     if (status === 'unauthenticated') {
//       router.push('/login')
//     }
//   }, [status, router])

//   const handleUploadComplete = (newUploadId: string) => {
//     setUploadId(newUploadId)
//     setJobId(null)
//     setResultId(null)
//   }

//   const handleGenerateStart = (newJobId: string) => {
//     setJobId(newJobId)
//     setResultId(null)
//   }

//   const handleGenerationComplete = (newResultId: string) => {
//     setResultId(newResultId)
//   }

//   if (status === 'loading') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center">
//         <div className="text-center">
//           <div className="text-6xl mb-4 animate-bounce">🦙</div>
//           <p className="text-xl font-semibold text-white">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
//       {/* Header */}
//       <header className="bg-gray-900/50 backdrop-blur-sm shadow-lg border-b border-gray-800">
//         <div className="container mx-auto px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="text-3xl">🦙</div>
//             <div>
//               <h1 className="text-2xl font-bold text-white">Photo AI</h1>
//               <p className="text-sm text-gray-400">Powered by Meta LLaMA</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
//               <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
//                 {session?.user?.name?.[0]?.toUpperCase() || 'U'}
//               </div>
//               <span className="font-medium text-white">{session?.user?.name}</span>
//             </div>
//             <button
//               onClick={() => signOut({ callbackUrl: '/' })}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="container mx-auto px-6 py-8">
//         <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white shadow-xl">
//           <h2 className="text-3xl font-bold mb-2">
//             Welcome, {session?.user?.name}!
//           </h2>
//           <p className="text-blue-100">Upload photos and let Meta LLaMA enhance your prompts for amazing AI images</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Left Column */}
//           <div className="space-y-6">
//             <ImageUploader onUploadComplete={handleUploadComplete} />
//             <PromptInput
//               uploadId={uploadId}
//               onGenerateStart={handleGenerateStart}
//             />
//           </div>

//           {/* Right Column */}
//           <div className="space-y-6">
//             {jobId && (
//               <ProcessingStatus
//                 jobId={jobId}
//                 onComplete={handleGenerationComplete}
//               />
//             )}
//             {resultId && <ResultGallery resultId={resultId} />}
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }