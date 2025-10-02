// app/api/uploads/[uploadId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { memoryStore } from '@/lib/memoryStore'

export async function GET(
  request: NextRequest,
  { params }: { params: { uploadId: string } }
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

    const { uploadId } = await params

    // Fetch upload from database
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

    // Verify ownership
    if (upload.userId !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      }, { status: 403 })
    }

    // Get memory data
    const memoryData = memoryStore.getUpload(uploadId)

    // Parse query params
    const { searchParams } = new URL(request.url)
    const includeFaces = searchParams.get('include') === 'faces'
    const includePreview = searchParams.get('preview') === 'true'

    const response: any = {
      success: true,
      data: {
        upload: {
          id: upload.id,
          imageCount: upload.imageCount,
          faceCount: upload.faceCount,
          status: upload.status,
          createdAt: upload.createdAt
        }
      }
    }

    if (includeFaces && memoryData) {
      response.data.faces = memoryData.faces
    }

    if (includePreview && memoryData) {
      // Generate simple previews (in production, create actual thumbnails)
      response.data.previews = memoryData.images.slice(0, 3).map((img, idx) => ({
        index: idx,
        thumbnail: `data:image/jpeg;base64,${img.slice(0, 100).toString('base64')}`
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Upload fetch error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch upload details'
      }
    }, { status: 500 })
  }
}