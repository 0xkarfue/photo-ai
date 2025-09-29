// app/api/generation/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { memoryStore } from '@/lib/memoryStore'

export async function POST(request: NextRequest) {
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

    const { uploadId, prompt, enhancedPrompt, options } = await request.json()

    // Validation
    if (!uploadId || !prompt) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Upload ID and prompt are required'
        }
      }, { status: 400 })
    }

    // Verify upload exists and belongs to user
    const upload = await prisma.upload.findUnique({
      where: { id: uploadId }
    })

    if (!upload) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Upload not found'
        }
      }, { status: 404 })
    }

    if (upload.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      }, { status: 403 })
    }

    // Check if faces were detected
    if (upload.faceCount === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_FACES',
          message: 'No faces detected in upload. Please upload images with clear faces.'
        }
      }, { status: 400 })
    }

    // Create job
    const job = await prisma.job.create({
      data: {
        uploadId,
        prompt: enhancedPrompt || prompt,
        status: 'QUEUED',
        progress: 0
      }
    })

    // Initialize job in memory
    memoryStore.setJob(job.id, {
      status: 'QUEUED',
      progress: 0
    })

    // Start async processing (non-blocking)
    processGenerationJob(job.id, uploadId, upload.faceCount).catch(err => {
      console.error('Job processing error:', err)
    })

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        estimatedTime: 45,
        status: 'QUEUED',
        message: 'Your image generation has started!',
        progress: 0
      }
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to start generation'
      }
    }, { status: 500 })
  }
}

// Simulated async processing function
async function processGenerationJob(jobId: string, uploadId: string, faceCount: number) {
  const steps = [
    { name: 'prompt-enhancement', duration: 2000, progress: 10 },
    { name: 'image-generation', duration: 15000, progress: 40 },
    { name: 'face-detection', duration: 5000, progress: 60 },
    { name: 'face-swapping', duration: 15000, progress: 90 },
    { name: 'final-processing', duration: 5000, progress: 100 }
  ]

  try {
    for (const step of steps) {
      // Update job status
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
          progress: step.progress
        }
      })

      memoryStore.updateJob(jobId, {
        status: 'PROCESSING',
        progress: step.progress
      })

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, step.duration))
    }

    // Complete job
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date()
      }
    })

    // Store result
    memoryStore.updateJob(jobId, {
      status: 'COMPLETED',
      progress: 100,
      result: `result_${jobId}`
    })

  } catch (error) {
    console.error('Job processing failed:', error)
    
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        progress: 0
      }
    })

    memoryStore.updateJob(jobId, {
      status: 'FAILED',
      progress: 0,
      error: 'Processing failed'
    })
  }
}