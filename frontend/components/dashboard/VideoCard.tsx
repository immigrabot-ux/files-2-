'use client'

import { Video, Play, Download, Trash2, MoreVertical, Clock, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface VideoCardProps {
  video: {
    id: string
    title: string
    status: string
    thumbnailUrl?: string
    durationSeconds?: number
    slideCount?: number
    resolution?: string
    storyMode: boolean
    createdAt: Date
    completedAt?: Date
  }
  onDelete?: (id: string) => void
}

const STATUS_CONFIG = {
  uploaded: { label: 'Uploaded', color: 'bg-gray-100 text-gray-800' },
  parsing: { label: 'Parsing', color: 'bg-blue-100 text-blue-800' },
  script_pending: { label: 'Script Pending', color: 'bg-yellow-100 text-yellow-800' },
  script_ready: { label: 'Script Ready', color: 'bg-yellow-100 text-yellow-800' },
  voice_pending: { label: 'Voice Pending', color: 'bg-purple-100 text-purple-800' },
  voice_ready: { label: 'Voice Ready', color: 'bg-purple-100 text-purple-800' },
  rendering: { label: 'Rendering', color: 'bg-orange-100 text-orange-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' }
}

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const status = STATUS_CONFIG[video.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.uploaded

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-900 relative">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Video className="w-12 h-12 text-gray-600" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={cn("text-xs font-medium px-2 py-1 rounded", status.color)}>
            {status.label}
          </span>
        </div>

        {/* Story Mode Badge */}
        {video.storyMode && (
          <div className="absolute top-2 left-2">
            <span className="text-xs font-medium px-2 py-1 rounded bg-primary text-white">
              ✨ Story Mode
            </span>
          </div>
        )}

        {/* Play Button */}
        {video.status === 'completed' && (
          <Link
            href={`/dashboard/videos/${video.id}`}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center transform scale-0 hover:scale-100 transition-transform">
              <Play className="w-8 h-8 text-primary ml-1" />
            </div>
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{video.title}</h3>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          {video.durationSeconds && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(video.durationSeconds)}</span>
            </div>
          )}
          {video.slideCount && (
            <div className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              <span>{video.slideCount} slides</span>
            </div>
          )}
          {video.resolution && (
            <span className="font-medium">{video.resolution}</span>
          )}
        </div>

        {/* Date */}
        <p className="text-xs text-gray-500 mb-3">
          Created {new Date(video.createdAt).toLocaleDateString()}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {video.status === 'completed' ? (
            <>
              <Button size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/videos/${video.id}`}>
                  <Play className="w-4 h-4 mr-2" />
                  View
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={`/api/videos/${video.id}/download`} download>
                  <Download className="w-4 h-4" />
                </a>
              </Button>
            </>
          ) : (
            <Button size="sm" className="flex-1" variant="outline" asChild>
              <Link href={`/dashboard/videos/${video.id}/continue`}>
                Continue
              </Link>
            </Button>
          )}

          {onDelete && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(video.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
