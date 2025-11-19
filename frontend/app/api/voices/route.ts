import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

// Mock voices data (in production, fetch from ElevenLabs)
const VOICES = [
  {
    id: 'rachel',
    name: 'Rachel',
    gender: 'female',
    accent: 'US',
    tone: 'professional',
    sampleUrl: 'https://s3.amazonaws.com/samples/rachel.mp3'
  },
  {
    id: 'adam',
    name: 'Adam',
    gender: 'male',
    accent: 'US',
    tone: 'confident',
    sampleUrl: 'https://s3.amazonaws.com/samples/adam.mp3'
  },
  {
    id: 'bella',
    name: 'Bella',
    gender: 'female',
    accent: 'UK',
    tone: 'friendly',
    sampleUrl: 'https://s3.amazonaws.com/samples/bella.mp3'
  },
  {
    id: 'josh',
    name: 'Josh',
    gender: 'male',
    accent: 'US',
    tone: 'enthusiastic',
    sampleUrl: 'https://s3.amazonaws.com/samples/josh.mp3'
  },
  {
    id: 'sam',
    name: 'Sam',
    gender: 'male',
    accent: 'US',
    tone: 'warm',
    sampleUrl: 'https://s3.amazonaws.com/samples/sam.mp3'
  }
]

export async function GET(req: NextRequest) {
  const { userId } = auth()

  if (!userId) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 }
    )
  }

  try {
    return NextResponse.json({
      success: true,
      data: {
        voices: VOICES
      }
    })

  } catch (error) {
    console.error('Get voices error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch voices'
        }
      },
      { status: 500 }
    )
  }
}
