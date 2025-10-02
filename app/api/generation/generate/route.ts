// app/api/generation/generate/route.ts - Updated for Hugging Face
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { memoryStore } from '@/lib/memoryStore'
import { generateImage } from '@/lib/imageGeneration'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }, { status: 401 })
    }

    const { uploadId, prompt, enhancedPrompt } = await request.json()

    if (!uploadId || !prompt) {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Upload ID and prompt required' }
      }, { status: 400 })
    }

    const upload = await prisma.upload.findUnique({
      where: { id: uploadId }
    })

    if (!upload) {
      return NextResponse.json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Upload not found' }
      }, { status: 404 })
    }

    if (upload.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' }
      }, { status: 403 })
    }

    const job = await prisma.job.create({
      data: {
        uploadId,
        prompt: enhancedPrompt || prompt,
        status: 'QUEUED',
        progress: 0
      }
    })

    memoryStore.setJob(job.id, {
      status: 'QUEUED',
      progress: 0
    })

    // Start generation with Hugging Face
    processHuggingFaceGeneration(job.id, enhancedPrompt || prompt).catch(err => {
      console.error('Job processing error:', err)
    })

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        estimatedTime: 30,
        status: 'QUEUED',
        message: 'Your image generation has started!',
        progress: 0
      }
    })

  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to start generation' }
    }, { status: 500 })
  }
}

async function processHuggingFaceGeneration(jobId: string, prompt: string) {
  try {
    // Update: Starting
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', progress: 20 }
    })
    memoryStore.updateJob(jobId, { status: 'PROCESSING', progress: 20 })

    console.log(`[Job ${jobId}] Starting Hugging Face generation...`)

    // Generate image (this takes 20-40 seconds)
    const result = await generateImage(prompt)

    if (!result.success || !result.imageData) {
      throw new Error(result.error || 'Image generation failed')
    }

    console.log(`[Job ${jobId}] Image generated successfully`)

    // Update: Almost done
    await prisma.job.update({
      where: { id: jobId },
      data: { progress: 90 }
    })
    memoryStore.updateJob(jobId, { progress: 90 })

    // Complete
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date()
      }
    })

    memoryStore.updateJob(jobId, {
      status: 'COMPLETED',
      progress: 100,
      result: `result_${jobId}`,
      imageData: result.imageData // Store the base64 image
    })

    console.log(`[Job ${jobId}] Generation complete!`)

  } catch (error: any) {
    console.error(`[Job ${jobId}] Generation failed:`, error)
    
    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'FAILED', progress: 0 }
    })

    memoryStore.updateJob(jobId, {
      status: 'FAILED',
      progress: 0,
      error: error.message || 'Generation failed'
    })
  }
}