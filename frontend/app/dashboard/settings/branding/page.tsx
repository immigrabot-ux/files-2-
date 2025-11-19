'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BrandingPage() {
  const [brandSettings, setBrandSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [logoPosition, setLogoPosition] = useState('top-right')
  const [introVideoUrl, setIntroVideoUrl] = useState('')
  const [outroVideoUrl, setOutroVideoUrl] = useState('')
  const [colorPrimary, setColorPrimary] = useState('#3B82F6')
  const [colorSecondary, setColorSecondary] = useState('#8B5CF6')

  useEffect(() => {
    fetchBrandSettings()
  }, [])

  const fetchBrandSettings = async () => {
    try {
      const response = await fetch('/api/branding')
      const data = await response.json()

      if (data.success && data.data) {
        const settings = data.data
        setBrandSettings(settings)
        setLogoUrl(settings.logoUrl || '')
        setLogoPosition(settings.logoPosition || 'top-right')
        setIntroVideoUrl(settings.introVideoUrl || '')
        setOutroVideoUrl(settings.outroVideoUrl || '')
        setColorPrimary(settings.colorPrimary || '#3B82F6')
        setColorSecondary(settings.colorSecondary || '#8B5CF6')
      }
    } catch (error) {
      console.error('Failed to fetch brand settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl,
          logoPosition,
          introVideoUrl,
          outroVideoUrl,
          colorPrimary,
          colorSecondary
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to save branding')
      }

      alert('Branding settings saved successfully!')

    } catch (error: any) {
      alert(error.message || 'Failed to save branding')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    // TODO: Upload to S3
    const fakeUrl = 'https://s3.amazonaws.com/logos/' + file.name
    setLogoUrl(fakeUrl)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Custom Branding</h1>
            <p className="text-gray-600">
              Customize your videos with your brand identity (Pro & Business plans only)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {/* Logo Settings */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Logo</h3>
              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Logo Image
                  </label>
                  {logoUrl ? (
                    <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                      <button
                        onClick={() => setLogoUrl('')}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Upload Logo</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleLogoUpload(file)
                        }}
                      />
                    </label>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    PNG or SVG recommended. Max 2MB.
                  </p>
                </div>

                {/* Logo Position */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Logo Position
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => setLogoPosition(pos)}
                        className={cn(
                          "p-3 border-2 rounded-lg text-sm capitalize transition-all",
                          logoPosition === pos
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {pos.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Intro/Outro Videos */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Intro & Outro</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Intro Video URL
                  </label>
                  <input
                    type="text"
                    value={introVideoUrl}
                    onChange={(e) => setIntroVideoUrl(e.target.value)}
                    placeholder="https://s3.amazonaws.com/videos/intro.mp4"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Short intro video (3-5 seconds recommended)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Outro Video URL
                  </label>
                  <input
                    type="text"
                    value={outroVideoUrl}
                    onChange={(e) => setOutroVideoUrl(e.target.value)}
                    placeholder="https://s3.amazonaws.com/videos/outro.mp4"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Short outro video (3-5 seconds recommended)
                  </p>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Brand Colors</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colorPrimary}
                      onChange={(e) => setColorPrimary(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorPrimary}
                      onChange={(e) => setColorPrimary(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secondary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={colorSecondary}
                      onChange={(e) => setColorSecondary(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorSecondary}
                      onChange={(e) => setColorSecondary(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Colors will be used for transitions and overlays
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Branding Settings'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
