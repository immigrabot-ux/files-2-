'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, File, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onUploadComplete: (data: any) => void
  onError: (error: string) => void
}

export function FileUploader({ onUploadComplete, onError }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }, [])

  const validateAndSetFile = (selectedFile: File) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/pdf',
      'application/vnd.apple.keynote'
    ]

    if (!allowedTypes.includes(selectedFile.type)) {
      onError('Only .pptx, .pdf, and .key files are supported')
      return
    }

    const maxSize = 100 * 1024 * 1024 // 100MB
    if (selectedFile.size > maxSize) {
      onError('File size exceeds 100MB limit')
      return
    }

    setFile(selectedFile)
  }

  const removeFile = () => {
    setFile(null)
    setUploadProgress(0)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Upload failed')
      }

      onUploadComplete(data.data)
      setFile(null)

    } catch (error: any) {
      onError(error.message || 'Failed to upload file')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
          )}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            Drag and drop your slides here
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse
          </p>
          <input
            type="file"
            id="file-input"
            className="hidden"
            accept=".pptx,.pdf,.key"
            onChange={handleFileInput}
          />
          <Button asChild variant="outline">
            <label htmlFor="file-input" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
          <p className="text-xs text-gray-400 mt-4">
            Supports: PowerPoint (.pptx), PDF (.pdf), Keynote (.key) • Max 100MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <File className="w-10 h-10 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload and Continue'}
          </Button>
        </div>
      )}
    </div>
  )
}
