import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { videoId, storyMode, storyTemplate, intensity, targetAudience } = body

    // Validate required fields
    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_VIDEO_ID', message: 'Video ID is required' }
        },
        { status: 400 }
      )
    }

    if (storyMode && !storyTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TEMPLATE',
            message: 'Story template is required when story mode is enabled'
          }
        },
        { status: 400 }
      )
    }

    // Get video and verify ownership
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        user: true
      }
    })

    if (!video) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VIDEO_NOT_FOUND', message: 'Video not found' }
        },
        { status: 404 }
      )
    }

    if (video.user.clerkUserId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied' }
        },
        { status: 403 }
      )
    }

    // Get slides (in production, fetch from database)
    // For now, we'll use mock data
    const slides = [
      {
        number: 1,
        text: "Sample slide text",
        speakerNotes: "Sample speaker notes"
      }
    ]

    // Update video settings
    await prisma.video.update({
      where: { id: videoId },
      data: {
        storyMode: storyMode || false,
        storyTemplate: storyTemplate || null,
        status: 'script_pending'
      }
    })

    // Trigger background task
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId,
        slides,
        storyMode: storyMode || false,
        storyTemplate: storyTemplate || null,
        intensity: intensity || 'medium',
        targetAudience: targetAudience || 'college students'
      })
    })

    if (!backendResponse.ok) {
      throw new Error('Failed to trigger script generation')
    }

    const result = await backendResponse.json()

    // Save scripts to database
    if (result.scripts) {
      for (const script of result.scripts) {
        await prisma.script.create({
          data: {
            videoId: videoId,
            slideNumber: script.slideNumber,
            content: script.content,
            wordCount: script.wordCount,
            estimatedDuration: script.estimatedDuration,
            edited: false,
            generatedWithAi: true,
            aiCost: script.aiCost
          }
        })
      }

      // Update video status
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'script_ready' }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        videoId: videoId,
        scripts: result.scripts,
        totalDuration: result.totalDuration,
        costEstimate: result.costEstimate
      }
    })

  } catch (error) {
    console.error('Script generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate scripts'
        }
      },
      { status: 500 }
    )
  }
}
