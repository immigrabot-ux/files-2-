'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Save, RotateCcw, Sparkles } from 'lucide-react'
import { Script } from '@/types'
import { cn } from '@/lib/utils'

interface ScriptEditorProps {
  scripts: Script[]
  onSave: (scripts: Script[]) => void
  onRegenerate: (slideNumber: number) => void
  isLoading?: boolean
}

export function ScriptEditor({ scripts, onSave, onRegenerate, isLoading }: ScriptEditorProps) {
  const [editedScripts, setEditedScripts] = useState<Script[]>(scripts)
  const [selectedSlide, setSelectedSlide] = useState<number>(1)
  const [hasChanges, setHasChanges] = useState(false)

  const handleContentChange = (slideNumber: number, newContent: string) => {
    const updated = editedScripts.map(script => {
      if (script.slideNumber === slideNumber) {
        const wordCount = newContent.trim().split(/\s+/).length
        const estimatedDuration = Math.ceil(wordCount / 2.5) // ~150 words per minute
        return {
          ...script,
          content: newContent,
          wordCount,
          estimatedDuration,
          edited: true
        }
      }
      return script
    })
    setEditedScripts(updated)
    setHasChanges(true)
  }

  const handleSave = () => {
    onSave(editedScripts)
    setHasChanges(false)
  }

  const handleRegenerate = (slideNumber: number) => {
    onRegenerate(slideNumber)
  }

  const currentScript = editedScripts.find(s => s.slideNumber === selectedSlide)

  return (
    <div className="flex gap-6 h-[600px]">
      {/* Slide List */}
      <div className="w-64 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
        <h3 className="font-semibold mb-3">Slides</h3>
        <div className="space-y-2">
          {editedScripts.map(script => (
            <button
              key={script.slideNumber}
              onClick={() => setSelectedSlide(script.slideNumber)}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-all",
                selectedSlide === script.slideNumber
                  ? "bg-primary text-white"
                  : "bg-gray-50 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">Slide {script.slideNumber}</span>
                {script.edited && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Edited
                  </span>
                )}
              </div>
              <div className="text-xs opacity-80">
                {script.wordCount} words • {script.estimatedDuration}s
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            Slide {currentScript?.slideNumber}
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRegenerate(selectedSlide)}
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={currentScript?.content || ''}
          onChange={(e) => handleContentChange(selectedSlide, e.target.value)}
          className="flex-1 w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Edit your script here..."
          disabled={isLoading}
        />

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex gap-6 text-sm text-gray-600">
            <div>
              <span className="font-semibold">{currentScript?.wordCount || 0}</span> words
            </div>
            <div>
              <span className="font-semibold">{currentScript?.estimatedDuration || 0}</span>s duration
            </div>
            <div>
              Target: <span className="font-semibold">150-225</span> words
            </div>
          </div>

          {hasChanges && (
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
