'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/ImageUploader'
import PromptInput from '@/components/PromptInput'
import ProcessingStatus from '@/components/ProcessingStatus'
import ResultGallery from '@/components/ResultGallery'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🦙</div>
          <p className="text-xl font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🦙</div>
            <div>
              <h1 className="text-2xl font-bold">Photo AI</h1>
              <p className="text-sm text-gray-600">Powered by Meta LLaMA</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              📚 History
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {session?.user?.name?.[0]?.toUpperCase()}
              </div>
              <span className="font-medium">{session?.user?.name}</span>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white">
          <h2 className="text-3xl font-bold mb-2">Welcome, {session?.user?.name}! 👋</h2>
          <p>Upload photos and let Meta LLaMA enhance your prompts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ImageUploader onUploadComplete={setUploadId} />
            <PromptInput 
              uploadId={uploadId}
              onGenerateStart={setJobId}
            />
          </div>

          <div className="space-y-6">
            {jobId && (
              <ProcessingStatus 
                jobId={jobId}
                onComplete={setResultId}
              />
            )}
            {resultId && <ResultGallery resultId={resultId} />}
          </div>
        </div>
      </main>
    </div>
  )
}