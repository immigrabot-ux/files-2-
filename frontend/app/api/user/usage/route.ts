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
      include: {
        usageStats: {
          where: {
            month: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }
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

    // Get plan limits
    const planLimits = {
      free: { videos: 5, storage: 2 * 1024 * 1024 * 1024 }, // 2GB
      pro: { videos: 50, storage: 50 * 1024 * 1024 * 1024 }, // 50GB
      business: { videos: 200, storage: 200 * 1024 * 1024 * 1024 } // 200GB
    }

    const limits = planLimits[user.subscriptionTier as keyof typeof planLimits] || planLimits.free

    const currentUsage = user.usageStats[0] || {
      videosCreated: 0,
      videosCompleted: 0,
      storageUsedBytes: BigInt(0)
    }

    return NextResponse.json({
      success: true,
      data: {
        currentPlan: user.subscriptionTier,
        videos: {
          used: currentUsage.videosCreated,
          limit: limits.videos,
          percentage: Math.round((currentUsage.videosCreated / limits.videos) * 100)
        },
        storage: {
          used: Number(currentUsage.storageUsedBytes),
          limit: limits.storage,
          usedFormatted: formatBytes(Number(currentUsage.storageUsedBytes)),
          limitFormatted: formatBytes(limits.storage),
          percentage: Math.round((Number(currentUsage.storageUsedBytes) / limits.storage) * 100)
        }
      }
    })

  } catch (error) {
    console.error('Get usage error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch usage' }
      },
      { status: 500 }
    )
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
