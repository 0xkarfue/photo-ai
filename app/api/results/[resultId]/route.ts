import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { memoryStore } from '@/lib/memoryStore'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resultId: string }> }
) {
  try {
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

    const { resultId } = await params
    const jobId = resultId.replace('result_', '')

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { upload: true }
    })

    if (!job) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Result not found'
        }
      }, { status: 404 })
    }

    if (job.upload.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      }, { status: 403 })
    }

    if (job.status !== 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_READY',
          message: `Result not ready yet. Current status: ${job.status}`
        }
      }, { status: 400 })
    }

    // Get the REAL generated image from memory
    const jobData = memoryStore.getJob(jobId)
    
    if (!jobData?.imageData) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: 'Generated image not found in memory'
        }
      }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const includeMetadata = searchParams.get('include') === 'metadata'

    const response: any = {
      success: true,
      data: {
        result: {
          id: resultId,
          jobId: job.id,
          image: {
            base64: jobData.imageData, // REAL generated image
            url: jobData.imageUrl,
            format: 'png',
            dimensions: { width: 1024, height: 1024 }
          },
          createdAt: job.completedAt
        }
      }
    }

    if (includeMetadata) {
      response.data.result.metadata = {
        originalPrompt: job.prompt,
        facesSwapped: job.upload.faceCount,
        processingTime: job.completedAt && job.createdAt 
          ? (job.completedAt.getTime() - job.createdAt.getTime()) / 1000
          : 0,
        model: 'stable-diffusion-xl',
        uploadId: job.uploadId
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Result fetch error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch result'
      }
    }, { status: 500 })
  }
}