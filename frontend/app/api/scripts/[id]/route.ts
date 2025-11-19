import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { content, wordCount, estimatedDuration } = body

    // Get script and verify ownership
    const script = await prisma.script.findUnique({
      where: { id: params.id },
      include: {
        video: {
          include: { user: true }
        }
      }
    })

    if (!script) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'SCRIPT_NOT_FOUND', message: 'Script not found' }
        },
        { status: 404 }
      )
    }

    if (script.video.user.clerkUserId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied' }
        },
        { status: 403 }
      )
    }

    // Update script
    const updatedScript = await prisma.script.update({
      where: { id: params.id },
      data: {
        content,
        wordCount,
        estimatedDuration,
        edited: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedScript
    })

  } catch (error) {
    console.error('Update script error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update script' }
      },
      { status: 500 }
    )
  }
}
