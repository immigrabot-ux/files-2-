'use client'

import { useState } from 'react'
import { FileUploader } from '@/components/upload/FileUploader'
import { useRouter } from 'next/navigation'

export default function CreatePage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleUploadComplete = (data: any) => {
    // Navigate to script generation page
    router.push(`/dashboard/videos/${data.videoId}/script`)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create New Video</h1>
            <p className="text-gray-600">
              Upload your slides to get started
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <FileUploader
            onUploadComplete={handleUploadComplete}
            onError={handleError}
          />

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Step 1 of 4: Upload Slides</p>
          </div>
        </div>
      </div>
    </div>
  )
}
