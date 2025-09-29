// app/api/user/history/route.ts
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // Filter by status
    const sort = searchParams.get('sort') || 'recent' // recent or oldest

    // Validation
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid pagination parameters'
        }
      }, { status: 400 })
    }

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      upload: {
        userId: session.user.id
      }
    }

    if (status && ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(status)) {
      where.status = status
    }

    // Get total count
    const totalItems = await prisma.job.count({ where })

    // Fetch jobs
    const jobs = await prisma.job.findMany({
      where,
      include: {
        upload: {
          select: {
            imageCount: true,
            faceCount: true
          }
        }
      },
      orderBy: {
        createdAt: sort === 'oldest' ? 'asc' : 'desc'
      },
      skip,
      take: limit
    })

    // Calculate pagination
    const totalPages = Math.ceil(totalItems / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    // Format response
    const history = jobs.map(job => ({
      id: job.id,
      prompt: job.prompt,
      status: job.status,
      progress: job.progress,
      resultId: job.status === 'COMPLETED' ? `result_${job.id}` : null,
      thumbnail: job.status === 'COMPLETED' 
        ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' 
        : null,
      imageCount: job.upload.imageCount,
      faceCount: job.upload.faceCount,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      processingTime: job.completedAt && job.createdAt
        ? (job.completedAt.getTime() - job.createdAt.getTime()) / 1000
        : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNext,
          hasPrev
        }
      }
    })

  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch history'
      }
    }, { status: 500 })
  }
}