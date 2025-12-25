// components/admin/DeliverableUploader.tsx
// Client component for uploading deliverables with actual file upload

'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, formatFileSize } from '@/lib/constants'

interface DeliverableUploaderProps {
  jobId: string
}

const deliverableTypes = [
  { value: 'RENDER_FRONT', label: 'Front View Render', category: '3D Renders' },
  { value: 'RENDER_PERSPECTIVE', label: 'Perspective Render', category: '3D Renders' },
  { value: 'RENDER_TOP', label: 'Top View Render', category: '3D Renders' },
  { value: 'RENDER_DETAIL', label: 'Detail Render', category: '3D Renders' },
  { value: 'DRAWING_ELEVATION', label: 'Elevation Drawing', category: '2D Drawings' },
  { value: 'DRAWING_PLAN', label: 'Floor Plan', category: '2D Drawings' },
  { value: 'DRAWING_SECTION', label: 'Section Drawing', category: '2D Drawings' },
  { value: 'CUT_LIST', label: 'Cut List', category: 'Technical' },
  { value: 'ASSEMBLY_GUIDE', label: 'Assembly Guide', category: 'Technical' },
  { value: 'MATERIAL_LIST', label: 'Material List', category: 'Technical' },
]

// Group deliverable types by category
const groupedTypes = deliverableTypes.reduce((acc, type) => {
  if (!acc[type.category]) acc[type.category] = []
  acc[type.category].push(type)
  return acc
}, {} as Record<string, typeof deliverableTypes>)

export function DeliverableUploader({ jobId }: DeliverableUploaderProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setUploadSuccess(null)

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${formatFileSize(file.size)}.`)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setSelectedFile(file)

    // Auto-fill name if empty
    if (!name) {
      const baseName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
      setName(baseName)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      setUploadError('Please select a file to upload')
      return
    }

    if (!name.trim()) {
      setUploadError('Please enter a name for the deliverable')
      return
    }

    if (!type) {
      setUploadError('Please select a deliverable type')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('jobId', jobId)
      formData.append('name', name.trim())
      formData.append('type', type)
      formData.append('description', description.trim())

      const res = await fetch('/api/admin/deliverables', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadSuccess(`Successfully uploaded "${name}"`)

      // Reset form
      setSelectedFile(null)
      setName('')
      setType('')
      setDescription('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh the page to show the new deliverable
      router.refresh()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p className="font-medium">{uploadError}</p>
        </div>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400">
          <p className="font-medium">{uploadSuccess}</p>
        </div>
      )}

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-2">
          Upload File <span className="text-red-400">*</span>
        </label>

        {selectedFile ? (
          <div className="flex items-center gap-3 p-4 bg-dark-elevated rounded-lg border border-border">
            <div className="w-12 h-12 bg-walnut/20 rounded-lg flex items-center justify-center text-2xl">
              {getFileIcon(selectedFile.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text truncate">{selectedFile.name}</p>
              <p className="text-sm text-text-light">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              type="button"
              onClick={clearSelectedFile}
              className="p-2 text-text-muted hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-walnut hover:bg-walnut/5 transition-colors"
          >
            <div className="text-4xl mb-2">📤</div>
            <p className="text-text font-medium">Click to select file</p>
            <p className="text-xs text-text-muted mt-1">
              Images, PDFs, Documents (max {MAX_FILE_SIZE_MB}MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-2">
          File Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Kitchen Front View Render"
          className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
        />
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-2">
          Deliverable Type <span className="text-red-400">*</span>
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
        >
          <option value="">Select type...</option>
          {Object.entries(groupedTypes).map(([category, types]) => (
            <optgroup key={category} label={category}>
              {types.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-light mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Optional description or notes about this deliverable"
          className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isUploading || !selectedFile}
        className="w-full py-3 bg-gradient-to-r from-walnut to-accent text-white font-bold rounded-lg hover:from-walnut-dark hover:to-walnut transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Uploading...
          </span>
        ) : (
          'Upload Deliverable'
        )}
      </button>
    </form>
  )
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  return '📎'
}
