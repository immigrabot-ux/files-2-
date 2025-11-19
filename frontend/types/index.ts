// Video Status Types
export type VideoStatus =
  | 'uploaded'
  | 'parsing'
  | 'script_pending'
  | 'script_ready'
  | 'voice_pending'
  | 'voice_ready'
  | 'rendering'
  | 'completed'
  | 'failed'

// Story Mode Types
export type StoryTemplate =
  | 'journey'
  | 'problem-solution'
  | 'timeline'
  | 'debate'
  | 'mystery'

export type StoryIntensity = 'low' | 'medium' | 'high'

// Video Interface
export interface Video {
  id: string
  userId: string
  title: string
  status: VideoStatus
  slidesFileUrl?: string
  videoFileUrl?: string
  thumbnailUrl?: string
  storyMode: boolean
  storyTemplate?: StoryTemplate
  voiceId?: string
  voiceSpeed: number
  backgroundMusic: boolean
  durationSeconds?: number
  slideCount?: number
  fileSizeBytes?: bigint
  resolution?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// Script Interface
export interface Script {
  id: string
  videoId: string
  slideNumber: number
  content: string
  wordCount?: number
  estimatedDuration?: number
  edited: boolean
  generatedWithAi: boolean
  aiCost?: number
  createdAt: Date
  updatedAt: Date
}

// Slide Interface
export interface Slide {
  number: number
  imageUrl: string
  text: string
  speakerNotes?: string
}

// Upload Response
export interface UploadResponse {
  success: boolean
  data?: {
    videoId: string
    fileUrl: string
    slideCount: number
    slides: Slide[]
  }
  error?: {
    code: string
    message: string
  }
}

// Script Generation Request
export interface GenerateScriptRequest {
  videoId: string
  storyMode: boolean
  storyTemplate?: StoryTemplate
  intensity?: StoryIntensity
  targetAudience?: string
}

// Voice Generation Request
export interface GenerateVoiceRequest {
  videoId: string
  voiceId: string
  speed: number
}

// API Response
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
