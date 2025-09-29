// app/api/uploads/images/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { memoryStore } from '@/lib/memoryStore'
import { processFaceData } from '@/lib/faceDetection'

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

    // Parse form data
    const formData = await request.formData()
    const uploadId = formData.get('uploadId') as string
    const files = formData.getAll('images') as File[]

    // Validation
    if (!uploadId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Upload ID is required'
        }
      }, { status: 400 })
    }

    if (files.length < 5 || files.length > 10) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please upload between 5 and 10 images'
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
          message: 'Upload session not found'
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

    // Convert files to buffers
    const imageBuffers = await Promise.all(
      files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Invalid file type')
        }

        // Validate file size (max 10MB per image)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File too large')
        }

        const arrayBuffer = await file.arrayBuffer()
        return Buffer.from(arrayBuffer)
      })
    )

    // Process faces
    const startTime = Date.now()
    const { faceData, totalFaces } = await processFaceData(imageBuffers)
    const processingTime = (Date.now() - startTime) / 1000

    if (totalFaces === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_FACES_DETECTED',
          message: 'No faces detected in uploaded images. Please upload clear photos with visible faces.'
        }
      }, { status: 400 })
    }

    // Update upload in database
    await prisma.upload.update({
      where: { id: uploadId },
      data: { 
        faceCount: totalFaces,
        imageCount: files.length
      }
    })

    // Store images and face data in memory
    memoryStore.setUpload(uploadId, {
      images: imageBuffers,
      faces: faceData,
      metadata: {
        totalSize: imageBuffers.reduce((sum, buf) => sum + buf.length, 0),
        fileTypes: files.map(f => f.type)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        uploadId,
        facesDetected: faceData,
        totalFaces,
        imageCount: files.length,
        processingTime: parseFloat(processingTime.toFixed(2)),
        message: `Successfully processed ${files.length} images with ${totalFaces} faces detected`
      }
    })

  } catch (error: any) {
    console.error('Image upload error:', error)
    
    if (error.message === 'Invalid file type') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: 'Only image files are allowed'
        }
      }, { status: 400 })
    }

    if (error.message === 'File too large') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'Each image must be less than 10MB'
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process images'
      }
    }, { status: 500 })
  }
}