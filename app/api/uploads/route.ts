// app/api/uploads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
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

    const { imageCount } = await request.json()

    // Validation
    if (!imageCount || imageCount < 5 || imageCount > 10) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Image count must be between 5 and 10'
        }
      }, { status: 400 })
    }

    // Create upload session
    const upload = await prisma.upload.create({
      data: {
        userId: session.user.id,
        imageCount,
        faceCount: 0,
        status: 'UPLOADED'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        uploadId: upload.id,
        sessionId: `session_${Date.now()}`,
        message: 'Upload session created successfully'
      }
    })

  } catch (error) {
    console.error('Upload creation error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create upload session'
      }
    }, { status: 500 })
  }
}