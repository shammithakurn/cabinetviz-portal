// components/JobFileUploader.tsx
// Client component for uploading files to an existing job

'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, formatFileSize } from '@/lib/constants'

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  category: string
  uploadedAt: string
}

interface JobFileUploaderProps {
  jobId: string
  onUploadComplete?: (file: UploadedFile) => void
}

export function JobFileUploader({ jobId, onUploadComplete }: JobFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('OTHER')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadError(null)
    setUploadSuccess(null)

    const validFiles: File[] = []
    const rejectedFiles: string[] = []

    acceptedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedFiles.push(`${file.name} (${formatFileSize(file.size)})`)
      } else {
        validFiles.push(file)
      }
    })

    if (rejectedFiles.length > 0) {
      setUploadError(`Files exceeding ${MAX_FILE_SIZE_MB}MB limit: ${rejectedFiles.join(', ')}. Please compress or resize these files.`)
    }

    if (validFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...validFiles])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: MAX_FILE_SIZE_BYTES,
  })

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    const uploadErrors: string[] = []
    let successCount = 0

    for (const file of pendingFiles) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jobId', jobId)
      formData.append('category', selectedCategory)

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (!res.ok) {
          uploadErrors.push(`${file.name}: ${data.error || 'Upload failed'}`)
        } else {
          successCount++
          if (onUploadComplete && data.file) {
            onUploadComplete(data.file)
          }
        }
      } catch {
        uploadErrors.push(`${file.name}: Network error`)
      }
    }

    setIsUploading(false)
    setPendingFiles([])

    if (uploadErrors.length > 0) {
      setUploadError(uploadErrors.join('\n'))
    }

    if (successCount > 0) {
      setUploadSuccess(`Successfully uploaded ${successCount} file(s). Refresh the page to see them.`)
    }
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
          <p className="font-medium whitespace-pre-line">{uploadError}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400">
          <p className="font-medium">{uploadSuccess}</p>
        </div>
      )}

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-2">File Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
        >
          <option value="MEASUREMENT">Measurements</option>
          <option value="SKETCH">Sketch</option>
          <option value="REFERENCE">Reference/Inspiration</option>
          <option value="PHOTO">Photo of Space</option>
          <option value="FLOOR_PLAN">Floor Plan</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-walnut bg-walnut/10'
            : 'border-border hover:border-border-light'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">📤</div>
        <p className="text-text font-medium mb-1">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to browse'}
        </p>
        <p className="text-xs text-text-muted">
          Images, PDFs, Documents (max {MAX_FILE_SIZE_MB}MB per file)
        </p>
      </div>

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text">Files to upload:</h4>
          {pendingFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-dark-elevated rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-dark-surface rounded flex items-center justify-center text-sm">
                  {file.type.startsWith('image/') ? '🖼️' : '📄'}
                </div>
                <div>
                  <p className="text-sm font-medium text-text truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removePendingFile(index)}
                className="p-1 text-text-muted hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={uploadFiles}
            disabled={isUploading}
            className="w-full btn btn-primary mt-3"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              `Upload ${pendingFiles.length} file(s)`
            )}
          </button>
        </div>
      )}
    </div>
  )
}
