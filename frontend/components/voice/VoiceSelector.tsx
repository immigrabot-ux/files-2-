'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Voice {
  id: string
  name: string
  gender: string
  accent: string
  tone: string
  sampleUrl: string
}

interface VoiceSelectorProps {
  onGenerate: (voiceId: string, speed: number) => void
  isGenerating: boolean
}

export function VoiceSelector({ onGenerate, isGenerating }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('rachel')
  const [speed, setSpeed] = useState<number>(1.0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/voices')
      const data = await response.json()

      if (data.success) {
        setVoices(data.data.voices)
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error)
    } finally {
      setLoading(false)
    }
  }

  const playPreview = (sampleUrl: string) => {
    const audio = new Audio(sampleUrl)
    audio.play()
  }

  const handleGenerate = () => {
    onGenerate(selectedVoice, speed)
  }

  if (loading) {
    return <div className="text-center py-8">Loading voices...</div>
  }

  return (
    <div className="space-y-6">
      {/* Voice Selection */}
      <div>
        <h3 className="font-semibold mb-4">Select Voice</h3>
        <div className="grid grid-cols-2 gap-4">
          {voices.map(voice => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoice(voice.id)}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all",
                selectedVoice === voice.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{voice.name}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{voice.gender} • {voice.accent}</p>
                    <p className="capitalize">{voice.tone}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playPreview(voice.sampleUrl)
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="Preview voice"
                >
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Speed Control */}
      <div>
        <h3 className="font-semibold mb-4">Speech Speed</h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Slow (0.5x)</span>
            <span className="font-semibold text-primary">{speed}x</span>
            <span>Fast (2.0x)</span>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? 'Generating Voiceovers...' : 'Generate Voiceovers'}
      </Button>

      {/* Info */}
      <div className="text-sm text-gray-500 text-center">
        <p>This will generate AI voiceovers for all {voices.length} slides</p>
        <p className="mt-1">Estimated time: ~2-3 minutes</p>
      </div>
    </div>
  )
}
