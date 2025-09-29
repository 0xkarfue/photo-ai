// app/api/results/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const resultId = searchParams.get('resultId')
    const filename = searchParams.get('filename') || 'generated-image'
    const format = searchParams.get('format') || 'png'

    if (!resultId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Result ID is required'
        }
      }, { status: 400 })
    }

    // Extract jobId from resultId
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

    // Check if completed
    if (job.status !== 'COMPLETED') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_READY',
          message: 'Result not ready for download'
        }
      }, { status: 400 })
    }

    // Generate placeholder image
    const placeholderImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

    // Set appropriate headers for download
    const headers = new Headers()
    headers.set('Content-Type', `image/${format}`)
    headers.set('Content-Disposition', `attachment; filename="${filename}.${format}"`)
    headers.set('Content-Length', placeholderImage.length.toString())

    return new NextResponse(placeholderImage, { headers })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to download result'
      }
    }, { status: 500 })
  }
}