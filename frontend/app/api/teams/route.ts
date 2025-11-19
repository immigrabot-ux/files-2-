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

    // Get teams where user is a member
    // Note: This requires the team tables to be created
    // For now, return empty array
    const teams: any[] = []

    return NextResponse.json({
      success: true,
      data: { teams }
    })

  } catch (error) {
    console.error('Get teams error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch teams' }
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
    const { name } = body

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

    // Check if user has Business plan
    if (user.subscriptionTier !== 'business') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYMENT_REQUIRED',
            message: 'Upgrade to Business plan to create teams'
          }
        },
        { status: 403 }
      )
    }

    // Create team
    // Note: This requires the team tables to be created
    const team = {
      id: 'team_' + Math.random().toString(36).substr(2, 9),
      name,
      ownerUserId: user.id,
      seatsTotal: 5,
      createdAt: new Date()
    }

    return NextResponse.json({
      success: true,
      data: team
    })

  } catch (error) {
    console.error('Create team error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create team' }
      },
      { status: 500 }
    )
  }
}
