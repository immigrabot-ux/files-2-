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
    const { videoId, voiceId, speed } = body

    // Validate required fields
    if (!videoId || !voiceId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'MISSING_FIELDS', message: 'Video ID and voice ID are required' }
        },
        { status: 400 }
      )
    }

    // Get video and verify ownership
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        user: true,
        scripts: true
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

    // Check if scripts exist
    if (!video.scripts || video.scripts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NO_SCRIPTS', message: 'Generate scripts first' }
        },
        { status: 400 }
      )
    }

    // Update video settings
    await prisma.video.update({
      where: { id: videoId },
      data: {
        voiceId: voiceId,
        voiceSpeed: speed || 1.0,
        status: 'voice_pending'
      }
    })

    // Prepare scripts for voice generation
    const scripts = video.scripts.map(s => ({
      slideNumber: s.slideNumber,
      content: s.content,
      estimatedDuration: s.estimatedDuration
    }))

    // Trigger background task
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId,
        scripts,
        voiceId,
        speed: speed || 1.0
      })
    })

    if (!backendResponse.ok) {
      throw new Error('Failed to trigger voice generation')
    }

    const result = await backendResponse.json()

    // Save audio files to database
    if (result.audioFiles) {
      for (const audio of result.audioFiles) {
        if (audio.audioUrl) {
          await prisma.audioFile.create({
            data: {
              videoId: videoId,
              slideNumber: audio.slideNumber,
              audioUrl: audio.audioUrl,
              durationSeconds: audio.duration,
              fileSizeBytes: audio.fileSizeBytes,
              voiceId: audio.voiceId,
              voiceSpeed: audio.voiceSpeed
            }
          })
        }
      }

      // Update video status
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'voice_ready',
          durationSeconds: result.totalDuration
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        videoId: videoId,
        audioFiles: result.audioFiles,
        totalDuration: result.totalDuration,
        costEstimate: result.costEstimate
      }
    })

  } catch (error) {
    console.error('Voice generation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate voiceovers'
        }
      },
      { status: 500 }
    )
  }
}
