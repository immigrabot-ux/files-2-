import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/pdf', // .pdf
  'application/vnd.apple.keynote' // .key
]

export async function POST(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  try {
    // Get form data
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NO_FILE', message: 'No file provided' }
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Only .pptx, .pdf, and .key files are supported'
          }
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'File size exceeds 100MB limit'
          }
        },
        { status: 400 }
      )
    }

    // Check user quota
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
      // Create user if doesn't exist
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      }).then(res => res.json())

      await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.email_addresses[0].email_address,
          firstName: clerkUser.first_name,
          lastName: clerkUser.last_name
        }
      })
    } else {
      // Check quota
      const videoLimit = {
        free: 5,
        pro: 50,
        business: 200
      }[user.subscriptionTier] || 5

      const currentUsage = user.usageStats[0]?.videosCreated || 0

      if (currentUsage >= videoLimit) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'QUOTA_EXCEEDED',
              message: `Monthly video limit (${videoLimit}) reached`
            }
          },
          { status: 403 }
        )
      }
    }

    // Upload file to S3
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // In production, use AWS SDK to upload to S3
    // For now, we'll simulate the upload
    const fileExtension = file.name.split('.').pop()
    const fileName = `${uuidv4()}.${fileExtension}`
    const fileUrl = `https://s3.amazonaws.com/bucket/${fileName}` // Placeholder

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        userId: user?.id || '',
        title: file.name.replace(/\.[^/.]+$/, ''),
        status: 'uploaded',
        slidesFileUrl: fileUrl,
        fileSizeBytes: BigInt(file.size)
      }
    })

    // Trigger background task to parse slides
    // In production, call Python backend API
    const parseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/parse-slides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: video.id,
        fileUrl: fileUrl,
        fileType: `.${fileExtension}`
      })
    })

    // Update video status
    await prisma.video.update({
      where: { id: video.id },
      data: { status: 'parsing' }
    })

    // Update usage stats
    const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    await prisma.usageStats.upsert({
      where: {
        userId_month: {
          userId: user?.id || '',
          month: currentMonth
        }
      },
      create: {
        userId: user?.id || '',
        month: currentMonth,
        videosCreated: 1
      },
      update: {
        videosCreated: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        videoId: video.id,
        fileUrl: fileUrl,
        slideCount: 0, // Will be updated after parsing
        slides: []
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to upload file'
        }
      },
      { status: 500 }
    )
  }
}
