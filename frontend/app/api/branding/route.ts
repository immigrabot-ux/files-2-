import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { brandSettings: true }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user.brandSettings || null
    })

  } catch (error) {
    console.error('Get branding error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch branding' }
      },
      { status: 500 }
    )
  }
}

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
    const {
      logoUrl,
      logoPosition,
      introVideoUrl,
      outroVideoUrl,
      colorPrimary,
      colorSecondary
    } = body

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        },
        { status: 404 }
      )
    }

    // Check if user has Pro or Business plan
    if (user.subscriptionTier === 'free') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYMENT_REQUIRED',
            message: 'Upgrade to Pro or Business plan to use custom branding'
          }
        },
        { status: 403 }
      )
    }

    // Upsert brand settings
    const brandSettings = await prisma.brandSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        logoUrl,
        logoPosition,
        introVideoUrl,
        outroVideoUrl,
        colorPrimary,
        colorSecondary
      },
      update: {
        logoUrl,
        logoPosition,
        introVideoUrl,
        outroVideoUrl,
        colorPrimary,
        colorSecondary
      }
    })

    return NextResponse.json({
      success: true,
      data: brandSettings
    })

  } catch (error) {
    console.error('Update branding error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update branding' }
      },
      { status: 500 }
    )
  }
}
