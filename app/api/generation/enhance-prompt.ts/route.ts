// app/api/generation/enhance-prompt/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { enhancePromptWithLLaMA } from '@/lib/llamaClient'

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

    const { prompt, context } = await request.json()

    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid prompt is required'
        }
      }, { status: 400 })
    }

    if (prompt.length < 3) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt must be at least 3 characters long'
        }
      }, { status: 400 })
    }

    if (prompt.length > 500) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt must be less than 500 characters'
        }
      }, { status: 400 })
    }

    // Enhance prompt using LLaMA
    const startTime = Date.now()
    const enhancement = await enhancePromptWithLLaMA(prompt)
    const processingTime = (Date.now() - startTime) / 1000

    return NextResponse.json({
      success: true,
      data: {
        originalPrompt: enhancement.originalPrompt,
        enhancedPrompt: enhancement.enhancedPrompt,
        improvements: enhancement.improvements,
        processingTime: parseFloat(processingTime.toFixed(2)),
        context: context || null
      }
    })

  } catch (error) {
    console.error('Prompt enhancement error:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to enhance prompt'
      }
    }, { status: 500 })
  }
}