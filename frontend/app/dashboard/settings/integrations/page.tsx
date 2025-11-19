'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const LMS_PLATFORMS = [
  {
    id: 'teachable',
    name: 'Teachable',
    logo: '🎓',
    description: 'Automatically upload videos to your Teachable courses',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your Teachable API key' },
      { name: 'school_domain', label: 'School Domain', type: 'text', placeholder: 'your-school.teachable.com' }
    ],
    docsUrl: 'https://docs.teachable.com/article/442-how-to-find-your-api-key'
  },
  {
    id: 'thinkific',
    name: 'Thinkific',
    logo: '📚',
    description: 'Sync videos directly to your Thinkific courses',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your Thinkific API key' },
      { name: 'subdomain', label: 'Subdomain', type: 'text', placeholder: 'your-school' }
    ],
    docsUrl: 'https://developers.thinkific.com/api/api-documentation/'
  },
  {
    id: 'kajabi',
    name: 'Kajabi',
    logo: '🚀',
    description: 'Connect your Kajabi products and posts',
    fields: [
      { name: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter your Kajabi API key' }
    ],
    docsUrl: 'https://help.kajabi.com/hc/en-us/articles/360037816874'
  }
]

export default function IntegrationsPage() {
  const [activeIntegrations, setActiveIntegrations] = useState<string[]>([])
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})

  const handleConnect = (platformId: string) => {
    // TODO: Save credentials to backend
    setActiveIntegrations(prev => [...prev, platformId])
    setEditingPlatform(null)
    setCredentials({})
  }

  const handleDisconnect = (platformId: string) => {
    setActiveIntegrations(prev => prev.filter(id => id !== platformId))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">LMS Integrations</h1>
            <p className="text-gray-600">
              Connect your Learning Management System to automatically sync videos
            </p>
          </div>

          {/* Integrations List */}
          <div className="space-y-4">
            {LMS_PLATFORMS.map(platform => {
              const isConnected = activeIntegrations.includes(platform.id)
              const isEditing = editingPlatform === platform.id

              return (
                <div key={platform.id} className="bg-white rounded-lg shadow-sm">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{platform.logo}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">{platform.name}</h3>
                            {isConnected && (
                              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                <Check className="w-3 h-3" />
                                Connected
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{platform.description}</p>
                          <a
                            href={platform.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            View setup guide
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {!isEditing && (
                        <div>
                          {isConnected ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnect(platform.id)}
                            >
                              Disconnect
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setEditingPlatform(platform.id)}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Connection Form */}
                    {isEditing && (
                      <div className="mt-6 pt-6 border-t space-y-4">
                        {platform.fields.map(field => (
                          <div key={field.name}>
                            <label className="block text-sm font-medium mb-2">
                              {field.label}
                            </label>
                            <input
                              type={field.type}
                              placeholder={field.placeholder}
                              value={credentials[field.name] || ''}
                              onChange={(e) =>
                                setCredentials(prev => ({
                                  ...prev,
                                  [field.name]: e.target.value
                                }))
                              }
                              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        ))}

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleConnect(platform.id)}
                            disabled={!Object.values(credentials).every(v => v)}
                            className="flex-1"
                          >
                            Connect {platform.name}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingPlatform(null)
                              setCredentials({})
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Connect your LMS platform using your API credentials</li>
              <li>When rendering a video, choose to upload directly to your LMS</li>
              <li>Select the course/product and the video will be automatically synced</li>
              <li>Students can access the video immediately in your course</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
