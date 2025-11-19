'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StoryTemplate, StoryIntensity } from '@/types'
import { cn } from '@/lib/utils'

interface StoryModeSelectorProps {
  onGenerate: (config: {
    storyMode: boolean
    storyTemplate?: StoryTemplate
    intensity?: StoryIntensity
  }) => void
  isGenerating: boolean
}

const STORY_TEMPLATES = [
  {
    id: 'journey' as StoryTemplate,
    name: 'Journey',
    description: 'Follow a character or entity through the concept as if traveling',
    example: '"Follow a photon as it travels through photosynthesis"',
    icon: '🚀'
  },
  {
    id: 'problem-solution' as StoryTemplate,
    name: 'Problem-Solution',
    description: 'Present a challenge first, then reveal the solution dramatically',
    example: '"Ancient civilizations faced food storage issues. Then came..."',
    icon: '💡'
  },
  {
    id: 'timeline' as StoryTemplate,
    name: 'Historical Timeline',
    description: 'Time-travel narrative through events',
    example: '"Let\'s rewind to 1776 when..."',
    icon: '⏳'
  },
  {
    id: 'debate' as StoryTemplate,
    name: 'Debate',
    description: 'Present multiple viewpoints dramatically',
    example: '"Scientists disagreed: Is light a wave or particle?"',
    icon: '⚖️'
  },
  {
    id: 'mystery' as StoryTemplate,
    name: 'Mystery',
    description: 'Reveal information gradually with suspense',
    example: '"A strange pattern emerged in the data..."',
    icon: '🔍'
  }
]

const INTENSITY_LEVELS = [
  {
    id: 'low' as StoryIntensity,
    name: 'Low',
    description: '80% educational, 20% story',
    details: 'Subtle storytelling with "Imagine" phrases and basic analogies'
  },
  {
    id: 'medium' as StoryIntensity,
    name: 'Medium',
    description: '60% educational, 40% story',
    details: 'Balanced narrative with character references and vivid descriptions'
  },
  {
    id: 'high' as StoryIntensity,
    name: 'High',
    description: '50% educational, 50% story',
    details: 'Full storytelling with dramatic language and detailed scenes'
  }
]

export function StoryModeSelector({ onGenerate, isGenerating }: StoryModeSelectorProps) {
  const [storyMode, setStoryMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<StoryTemplate>('journey')
  const [intensity, setIntensity] = useState<StoryIntensity>('medium')

  const handleGenerate = () => {
    onGenerate({
      storyMode,
      storyTemplate: storyMode ? selectedTemplate : undefined,
      intensity: storyMode ? intensity : undefined
    })
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-4">
        <button
          onClick={() => setStoryMode(false)}
          className={cn(
            "flex-1 p-4 rounded-lg border-2 transition-all",
            !storyMode
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <h3 className="font-semibold mb-1">Normal Mode</h3>
          <p className="text-sm text-gray-600">
            Professional, straightforward lecture scripts
          </p>
        </button>

        <button
          onClick={() => setStoryMode(true)}
          className={cn(
            "flex-1 p-4 rounded-lg border-2 transition-all",
            storyMode
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          )}
        >
          <h3 className="font-semibold mb-1">Story Mode ✨</h3>
          <p className="text-sm text-gray-600">
            Transform content into engaging narratives
          </p>
        </button>
      </div>

      {/* Story Mode Options */}
      {storyMode && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Template Selection */}
          <div>
            <h4 className="font-semibold mb-3">Choose Story Template</h4>
            <div className="grid gap-3">
              {STORY_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-all",
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1">
                      <h5 className="font-semibold mb-1">{template.name}</h5>
                      <p className="text-sm text-gray-600 mb-2">
                        {template.description}
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        Example: {template.example}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Selection */}
          <div>
            <h4 className="font-semibold mb-3">Story Intensity</h4>
            <div className="grid grid-cols-3 gap-3">
              {INTENSITY_LEVELS.map(level => (
                <button
                  key={level.id}
                  onClick={() => setIntensity(level.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-center transition-all",
                    intensity === level.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <h5 className="font-semibold mb-1">{level.name}</h5>
                  <p className="text-xs text-gray-600 mb-2">{level.description}</p>
                  <p className="text-xs text-gray-500">{level.details}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? 'Generating Scripts...' : 'Generate Scripts'}
      </Button>
    </div>
  )
}
