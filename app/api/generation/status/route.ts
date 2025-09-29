// app/api/generation/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { memoryStore } from '@/lib/memoryStore'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Job ID is required'
        }
      }, { status: 400 })
    }

    // Fetch job from database
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        upload: true
      }
    })

    if (!job) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Job not found'
        }
      }, { status: 404 })
    }

    // Verify ownership
    if (job.upload.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      }, { status: 403 })
    }

    // Get memory data for additional info
    const memoryData = memoryStore.getJob(jobId)

    // Calculate estimated time remaining
    const estimatedTimeRemaining = job.progress < 100 
      ? Math.ceil((100 - job.progress) * 0.5) 
      : 0

    const response: any = {
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        currentStep: getCurrentStep(job.progress),
        message: getStatusMessage(job.status, job.progress),
        estimatedTimeRemaining,
        createdAt: job.createdAt
      }
    }

    // Add result if completed
    if (job.status === 'COMPLETED' && memoryData?.result) {
      response.data.resultId = memoryData.result
      response.data.completedAt = job.completedAt
    }

    // Add error if failed
    if (job.status === 'FAILED') {
      response.data.error = memoryData?.error || 'Generation failed'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Status fetch error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch job status'
      }
    }, { status: 500 })
  }
}

function getCurrentStep(progress: number): string {
  if (progress < 10) return 'queued'
  if (progress < 40) return 'image-generation'
  if (progress < 60) return 'face-detection'
  if (progress < 90) return 'face-swapping'
  if (progress < 100) return 'final-processing'
  return 'completed'
}

function getStatusMessage(status: string, progress: number): string {
  if (status === 'QUEUED') return 'Your job is in queue...'
  if (status === 'FAILED') return 'Generation failed'
  if (status === 'COMPLETED') return 'Generation complete!'
  
  // Processing messages based on progress
  if (progress < 10) return 'Starting generation...'
  if (progress < 40) return 'Generating base image...'
  if (progress < 60) return 'Detecting faces in generated image...'
  if (progress < 90) return 'Swapping faces from your photos...'
  if (progress < 100) return 'Finalizing your image...'
  
  return 'Processing...'
}