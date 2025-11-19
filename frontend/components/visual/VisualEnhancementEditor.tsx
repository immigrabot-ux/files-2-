'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MousePointer, Circle, Square, Type, ZoomIn, Save, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Annotation {
  type: 'arrow' | 'circle' | 'rectangle' | 'text'
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  color: string
  timestamp: number
}

interface ZoomEffect {
  x: number
  y: number
  scale: number
  duration: number
  timestamp: number
}

interface VisualEnhancement {
  slideNumber: number
  annotations: Annotation[]
  zoomEffects: ZoomEffect[]
}

interface VisualEnhancementEditorProps {
  slides: any[]
  enhancements: VisualEnhancement[]
  onSave: (enhancements: VisualEnhancement[]) => void
}

export function VisualEnhancementEditor({
  slides,
  enhancements,
  onSave
}: VisualEnhancementEditorProps) {
  const [selectedSlide, setSelectedSlide] = useState(1)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [currentEnhancements, setCurrentEnhancements] = useState<VisualEnhancement[]>(enhancements)
  const [color, setColor] = useState('#FF0000')

  const tools = [
    { id: 'arrow', icon: MousePointer, label: 'Arrow' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'zoom', icon: ZoomIn, label: 'Zoom' }
  ]

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTool) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const slideEnhancement = currentEnhancements.find(e => e.slideNumber === selectedSlide)

    if (selectedTool === 'zoom') {
      // Add zoom effect
      const newZoom: ZoomEffect = {
        x,
        y,
        scale: 1.5,
        duration: 2.0,
        timestamp: 0
      }

      if (slideEnhancement) {
        setCurrentEnhancements(prev =>
          prev.map(e =>
            e.slideNumber === selectedSlide
              ? { ...e, zoomEffects: [...e.zoomEffects, newZoom] }
              : e
          )
        )
      } else {
        setCurrentEnhancements(prev => [
          ...prev,
          {
            slideNumber: selectedSlide,
            annotations: [],
            zoomEffects: [newZoom]
          }
        ])
      }
    } else {
      // Add annotation
      const newAnnotation: Annotation = {
        type: selectedTool as any,
        x,
        y,
        width: 100,
        height: 100,
        color,
        timestamp: 0,
        text: selectedTool === 'text' ? 'Click to edit' : undefined
      }

      if (slideEnhancement) {
        setCurrentEnhancements(prev =>
          prev.map(e =>
            e.slideNumber === selectedSlide
              ? { ...e, annotations: [...e.annotations, newAnnotation] }
              : e
          )
        )
      } else {
        setCurrentEnhancements(prev => [
          ...prev,
          {
            slideNumber: selectedSlide,
            annotations: [newAnnotation],
            zoomEffects: []
          }
        ])
      }
    }
  }

  const handleSave = () => {
    onSave(currentEnhancements)
  }

  const slideEnhancement = currentEnhancements.find(e => e.slideNumber === selectedSlide)

  return (
    <div className="flex gap-6 h-[600px]">
      {/* Slide List */}
      <div className="w-64 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
        <h3 className="font-semibold mb-3">Slides</h3>
        <div className="space-y-2">
          {slides.map(slide => {
            const hasEnhancements = currentEnhancements.some(e => e.slideNumber === slide.number)
            return (
              <button
                key={slide.number}
                onClick={() => setSelectedSlide(slide.number)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all",
                  selectedSlide === slide.number
                    ? "bg-primary text-white"
                    : "bg-gray-50 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Slide {slide.number}</span>
                  {hasEnhancements && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Enhanced
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div className="flex gap-2">
            {tools.map(tool => {
              const Icon = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    selectedTool === tool.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  )}
                  title={tool.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Canvas */}
        <div
          onClick={handleCanvasClick}
          className="flex-1 border-2 border-gray-200 rounded-lg bg-gray-50 relative overflow-hidden cursor-crosshair"
        >
          {/* Slide Preview (placeholder) */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">Slide {selectedSlide}</p>
              <p className="text-sm">Click to add {selectedTool || 'annotations'}</p>
            </div>
          </div>

          {/* Annotations */}
          {slideEnhancement?.annotations.map((annotation, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: annotation.x,
                top: annotation.y,
                width: annotation.width,
                height: annotation.height,
                border: `3px solid ${annotation.color}`,
                borderRadius: annotation.type === 'circle' ? '50%' : '0'
              }}
              className="pointer-events-none"
            >
              {annotation.text && (
                <span
                  style={{ color: annotation.color }}
                  className="font-bold text-lg"
                >
                  {annotation.text}
                </span>
              )}
            </div>
          ))}

          {/* Zoom Effects */}
          {slideEnhancement?.zoomEffects.map((zoom, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: zoom.x - 25,
                top: zoom.y - 25,
                width: 50,
                height: 50,
                border: '3px dashed #3B82F6',
                borderRadius: '50%'
              }}
              className="pointer-events-none flex items-center justify-center"
            >
              <ZoomIn className="w-6 h-6 text-primary" />
            </div>
          ))}
        </div>

        {/* Enhancement List */}
        {slideEnhancement && (slideEnhancement.annotations.length > 0 || slideEnhancement.zoomEffects.length > 0) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold mb-2 text-sm">Enhancements</h4>
            <div className="space-y-1 text-sm">
              {slideEnhancement.annotations.map((ann, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="capitalize">{ann.type} at ({Math.round(ann.x)}, {Math.round(ann.y)})</span>
                  <button
                    onClick={() => {
                      setCurrentEnhancements(prev =>
                        prev.map(e =>
                          e.slideNumber === selectedSlide
                            ? { ...e, annotations: e.annotations.filter((_, i) => i !== idx) }
                            : e
                        )
                      )
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {slideEnhancement.zoomEffects.map((zoom, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>Zoom {zoom.scale}x at ({Math.round(zoom.x)}, {Math.round(zoom.y)})</span>
                  <button
                    onClick={() => {
                      setCurrentEnhancements(prev =>
                        prev.map(e =>
                          e.slideNumber === selectedSlide
                            ? { ...e, zoomEffects: e.zoomEffects.filter((_, i) => i !== idx) }
                            : e
                        )
                      )
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-4">
          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Enhancements
          </Button>
        </div>
      </div>
    </div>
  )
}
