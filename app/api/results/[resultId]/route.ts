// app/api/results/[resultId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
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

    const { resultId } = params
    
    // Extract jobId from resultId (format: result_jobId)
    const jobId = resultId.replace('result_', '')

    // Fetch job
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
          message: 'Result not found'
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

    // Check if job is completed
    if (job.status !== 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_READY',
          message: `Result not ready yet. Current status: ${job.status}`
        }
      }, { status: 400 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'base64'
    const includeMetadata = searchParams.get('include') === 'metadata'

    // Generate placeholder image (in production, return actual generated image)
    // This is a 1x1 transparent PNG
    const placeholderImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    const response: any = {
      success: true,
      data: {
        result: {
          id: resultId,
          jobId: job.id,
          image: {
            base64: `data:image/png;base64,${placeholderImage.toString('base64')}`,
            format: 'png',
            dimensions: { width: 1024, height: 1024 },
            size: placeholderImage.length
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