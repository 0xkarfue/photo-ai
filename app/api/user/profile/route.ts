// app/api/user/profile/route.ts
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

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        createdAt: true,
        uploads: {
          select: {
            id: true,
            imageCount: true,
            faceCount: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            uploads: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      }, { status: 404 })
    }

    // Calculate statistics
    const totalGenerations = await prisma.job.count({
      where: {
        upload: {
          userId: session.user.id
        }
      }
    })

    const completedGenerations = await prisma.job.count({
      where: {
        upload: {
          userId: session.user.id
        },
        status: 'COMPLETED'
      }
    })

    const totalFacesProcessed = user.uploads.reduce(
      (sum, upload) => sum + upload.faceCount, 
      0
    )

    const lastUpload = user.uploads.length > 0 
      ? user.uploads[user.uploads.length - 1] 
      : null

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          createdAt: user.createdAt
        },
        stats: {
          totalUploads: user._count.uploads,
          totalGenerations,
          completedGenerations,
          facesProcessed: totalFacesProcessed,
          lastActivity: lastUpload?.createdAt || user.createdAt
        }
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch profile'
      }
    }, { status: 500 })
  }
}