// app/jobs/new/page.tsx
// Create new job page with multi-step form

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, formatFileSize } from '@/lib/constants'

type FormStep = 'details' | 'dimensions' | 'style' | 'files' | 'review'

interface FormData {
  // Basic Details
  title: string
  description: string
  projectType: string
  roomType: string
  priority: string
  package: string
  
  // Dimensions
  roomWidth: string
  roomLength: string
  roomHeight: string
  dimensionUnit: string
  
  // Style Preferences
  cabinetStyle: string
  materialType: string
  colorScheme: string
  handleStyle: string
  
  // Other
  budget: string
  deadline: string
  notes: string
}

interface UploadedFile {
  file: File
  category: string
  preview?: string
}

export default function NewJobPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<FormStep>('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    projectType: '',
    roomType: '',
    priority: 'NORMAL',
    package: 'PROFESSIONAL',
    roomWidth: '',
    roomLength: '',
    roomHeight: '',
    dimensionUnit: 'mm',
    cabinetStyle: '',
    materialType: '',
    colorScheme: '',
    handleStyle: '',
    budget: '',
    deadline: '',
    notes: '',
  })

  const steps: { key: FormStep; label: string; icon: string }[] = [
    { key: 'details', label: 'Project Details', icon: '📋' },
    { key: 'dimensions', label: 'Dimensions', icon: '📐' },
    { key: 'style', label: 'Style & Materials', icon: '🎨' },
    { key: 'files', label: 'Upload Files', icon: '📁' },
    { key: 'review', label: 'Review & Submit', icon: '✅' },
  ]

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const [fileSizeError, setFileSizeError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFileSizeError(null)
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
      setFileSizeError(`Files exceeding ${MAX_FILE_SIZE_MB}MB limit: ${rejectedFiles.join(', ')}. Please compress or resize these files.`)
    }

    if (validFiles.length > 0) {
      const newFiles = validFiles.map((file) => ({
        file,
        category: 'OTHER',
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }))
      setUploadedFiles((prev) => [...prev, ...newFiles])
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

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const updateFileCategory = (index: number, category: string) => {
    setUploadedFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, category } : f))
    )
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Create job
      const jobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          roomWidth: formData.roomWidth ? parseFloat(formData.roomWidth) : null,
          roomLength: formData.roomLength ? parseFloat(formData.roomLength) : null,
          roomHeight: formData.roomHeight ? parseFloat(formData.roomHeight) : null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        }),
      })

      if (!jobRes.ok) {
        throw new Error('Failed to create job')
      }

      const { job } = await jobRes.json()

      // Upload files if any
      if (uploadedFiles.length > 0) {
        const uploadErrors: string[] = []

        for (const uploadedFile of uploadedFiles) {
          const formData = new FormData()
          formData.append('file', uploadedFile.file)
          formData.append('jobId', job.id)
          formData.append('category', uploadedFile.category)

          try {
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            })

            if (!uploadRes.ok) {
              const errorData = await uploadRes.json()
              uploadErrors.push(`${uploadedFile.file.name}: ${errorData.error || 'Upload failed'}`)
            }
          } catch {
            uploadErrors.push(`${uploadedFile.file.name}: Network error`)
          }
        }

        if (uploadErrors.length > 0) {
          console.error('File upload errors:', uploadErrors)
          alert(`Job created but some files failed to upload:\n${uploadErrors.join('\n')}`)
        }
      }

      router.push(`/jobs/${job.id}`)
    } catch (error) {
      console.error('Failed to create job:', error)
      alert('Failed to create job. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToStep = (step: FormStep) => setCurrentStep(step)
  const nextStep = () => {
    const next = steps[currentStepIndex + 1]
    if (next) setCurrentStep(next.key)
  }
  const prevStep = () => {
    const prev = steps[currentStepIndex - 1]
    if (prev) setCurrentStep(prev.key)
  }

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <div className="bg-dark-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-dark-elevated rounded-lg transition-colors text-text-light"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-text">Create New Job</h1>
                <p className="text-sm text-text-light">Submit a new cabinet design project</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-dark-surface border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <button
                key={step.key}
                onClick={() => goToStep(step.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentStep === step.key
                    ? 'bg-walnut/20 text-walnut'
                    : index < currentStepIndex
                    ? 'text-green-400'
                    : 'text-text-muted'
                }`}
              >
                <span className="text-lg">{step.icon}</span>
                <span className="font-medium text-sm hidden sm:inline">{step.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-dark-surface rounded-2xl border border-border p-8">
          {/* Step 1: Project Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-text mb-1">Project Details</h2>
                <p className="text-text-light">Tell us about your cabinet project</p>
              </div>

              <div>
                <label className="label">Project Title *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Smith Kitchen Renovation"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Project Type *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'KITCHEN', label: 'Kitchen', icon: '🍳' },
                    { value: 'WARDROBE', label: 'Wardrobe', icon: '👔' },
                    { value: 'BATHROOM_VANITY', label: 'Bathroom', icon: '🚿' },
                    { value: 'ENTERTAINMENT_UNIT', label: 'Entertainment', icon: '📺' },
                    { value: 'HOME_OFFICE', label: 'Home Office', icon: '💼' },
                    { value: 'LAUNDRY', label: 'Laundry', icon: '🧺' },
                    { value: 'CUSTOM', label: 'Custom', icon: '🔧' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateField('projectType', type.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.projectType === type.value
                          ? 'border-walnut bg-walnut/10'
                          : 'border-border hover:border-border-light'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-sm font-medium text-text">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-[120px]"
                  placeholder="Describe the project, any specific requirements, customer preferences..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Priority</label>
                  <select
                    className="input"
                    value={formData.priority}
                    onChange={(e) => updateField('priority', e.target.value)}
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="label">Package</label>
                  <select
                    className="input"
                    value={formData.package}
                    onChange={(e) => updateField('package', e.target.value)}
                  >
                    <option value="BASIC">Basic ($79)</option>
                    <option value="PROFESSIONAL">Professional ($149)</option>
                    <option value="PARTNER">Partner (Subscription)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dimensions */}
          {currentStep === 'dimensions' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-text mb-1">Room Dimensions</h2>
                <p className="text-text-light">Enter the measurements for the space</p>
              </div>

              <div>
                <label className="label">Measurement Unit</label>
                <div className="flex gap-2">
                  {['mm', 'cm', 'm', 'inches', 'feet'].map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => updateField('dimensionUnit', unit)}
                      className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                        formData.dimensionUnit === unit
                          ? 'border-walnut bg-walnut/10 text-walnut'
                          : 'border-border hover:border-border-light text-text'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Width</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={formData.roomWidth}
                    onChange={(e) => updateField('roomWidth', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Length/Depth</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={formData.roomLength}
                    onChange={(e) => updateField('roomLength', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Height</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={formData.roomHeight}
                    onChange={(e) => updateField('roomHeight', e.target.value)}
                  />
                </div>
              </div>

              {formData.projectType === 'KITCHEN' && (
                <div>
                  <label className="label">Kitchen Layout</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'L_SHAPED', label: 'L-Shaped' },
                      { value: 'U_SHAPED', label: 'U-Shaped' },
                      { value: 'GALLEY', label: 'Galley' },
                      { value: 'SINGLE_WALL', label: 'Single Wall' },
                      { value: 'ISLAND', label: 'Island' },
                      { value: 'CUSTOM', label: 'Custom' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => updateField('roomType', type.value)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          formData.roomType === type.value
                            ? 'border-walnut bg-walnut/10'
                            : 'border-border hover:border-border-light'
                        }`}
                      >
                        <div className="text-sm font-medium text-text">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Style & Materials */}
          {currentStep === 'style' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-text mb-1">Style & Materials</h2>
                <p className="text-text-light">Define the look and feel of the cabinets</p>
              </div>

              <div>
                <label className="label">Cabinet Style</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    'Modern/Minimalist',
                    'Traditional',
                    'Shaker',
                    'Contemporary',
                    'Farmhouse',
                    'Industrial',
                  ].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => updateField('cabinetStyle', style)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.cabinetStyle === style
                          ? 'border-walnut bg-walnut/10 text-walnut'
                          : 'border-border hover:border-border-light text-text'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Material Type</label>
                <select
                  className="input"
                  value={formData.materialType}
                  onChange={(e) => updateField('materialType', e.target.value)}
                >
                  <option value="">Select material...</option>
                  <option value="MDF">MDF (Painted)</option>
                  <option value="Laminate">Laminate</option>
                  <option value="Melamine">Melamine</option>
                  <option value="Solid Wood">Solid Wood</option>
                  <option value="Veneer">Wood Veneer</option>
                  <option value="Acrylic">High Gloss Acrylic</option>
                  <option value="Other">Other (specify in notes)</option>
                </select>
              </div>

              <div>
                <label className="label">Color Scheme / Finish</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., White gloss, Oak natural, Dark walnut..."
                  value={formData.colorScheme}
                  onChange={(e) => updateField('colorScheme', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Handle Style</label>
                <select
                  className="input"
                  value={formData.handleStyle}
                  onChange={(e) => updateField('handleStyle', e.target.value)}
                >
                  <option value="">Select handle style...</option>
                  <option value="Handleless">Handleless / Push-to-open</option>
                  <option value="Bar">Bar Handles</option>
                  <option value="Cup">Cup Handles</option>
                  <option value="Knob">Knobs</option>
                  <option value="Integrated">Integrated / J-Pull</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Budget (optional)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="$"
                    value={formData.budget}
                    onChange={(e) => updateField('budget', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Deadline (optional)</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.deadline}
                    onChange={(e) => updateField('deadline', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Additional Notes</label>
                <textarea
                  className="input min-h-[100px]"
                  placeholder="Any other requirements, appliance locations, special features..."
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 4: File Upload */}
          {currentStep === 'files' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-text mb-1">Upload Files</h2>
                <p className="text-text-light">
                  Upload sketches, measurements, photos, or inspiration images
                </p>
              </div>

              {fileSizeError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400">
                  <p className="font-medium">⚠️ {fileSizeError}</p>
                </div>
              )}

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-walnut bg-walnut/10'
                    : 'border-border hover:border-border-light'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-5xl mb-4">📤</div>
                <p className="text-text font-medium mb-2">
                  {isDragActive
                    ? 'Drop files here...'
                    : 'Drag & drop files here, or click to browse'}
                </p>
                <p className="text-sm text-text-muted">
                  Supports: Images (PNG, JPG), PDFs, Documents
                </p>
                <p className="text-xs text-text-muted mt-2">
                  Maximum file size: {MAX_FILE_SIZE_MB}MB per file
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-text">Uploaded Files</h3>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-dark-elevated rounded-xl"
                    >
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-dark-surface rounded-lg flex items-center justify-center text-2xl">
                          📄
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-text truncate">
                          {file.file.name}
                        </p>
                        <select
                          value={file.category}
                          onChange={(e) => updateFileCategory(index, e.target.value)}
                          className="mt-1 text-sm border border-border rounded-lg px-2 py-1 bg-dark-surface text-text"
                        >
                          <option value="MEASUREMENT">Measurements</option>
                          <option value="SKETCH">Sketch</option>
                          <option value="REFERENCE">Reference/Inspiration</option>
                          <option value="PHOTO">Photo of Space</option>
                          <option value="FLOOR_PLAN">Floor Plan</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-text mb-1">Review & Submit</h2>
                <p className="text-text-light">Please review your project details before submitting</p>
              </div>

              <div className="grid gap-6">
                <div className="bg-dark-elevated rounded-xl p-5">
                  <h3 className="font-semibold text-text mb-3">Project Details</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-text-light">Title</dt>
                      <dd className="font-medium text-text">{formData.title || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-text-light">Type</dt>
                      <dd className="font-medium text-text">{formData.projectType || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-text-light">Package</dt>
                      <dd className="font-medium text-text">{formData.package}</dd>
                    </div>
                    <div>
                      <dt className="text-text-light">Priority</dt>
                      <dd className="font-medium text-text">{formData.priority}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-dark-elevated rounded-xl p-5">
                  <h3 className="font-semibold text-text mb-3">Dimensions</h3>
                  <dl className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-text-light">Width</dt>
                      <dd className="font-medium text-text">
                        {formData.roomWidth} {formData.dimensionUnit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-light">Length</dt>
                      <dd className="font-medium text-text">
                        {formData.roomLength} {formData.dimensionUnit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-text-light">Height</dt>
                      <dd className="font-medium text-text">
                        {formData.roomHeight} {formData.dimensionUnit}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-dark-elevated rounded-xl p-5">
                  <h3 className="font-semibold text-text mb-3">Style</h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-text-light">Cabinet Style</dt>
                      <dd className="font-medium text-text">{formData.cabinetStyle || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-text-light">Material</dt>
                      <dd className="font-medium text-text">{formData.materialType || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-text-light">Color/Finish</dt>
                      <dd className="font-medium text-text">{formData.colorScheme || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-text-light">Handles</dt>
                      <dd className="font-medium text-text">{formData.handleStyle || '-'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-dark-elevated rounded-xl p-5">
                  <h3 className="font-semibold text-text mb-3">Files</h3>
                  <p className="text-sm text-text-light">
                    {uploadedFiles.length} file(s) to be uploaded
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="btn btn-secondary"
            >
              ← Previous
            </button>

            {currentStep === 'review' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.title || !formData.projectType}
                className="btn btn-primary"
              >
                {isSubmitting ? 'Creating Job...' : 'Submit Job →'}
              </button>
            ) : (
              <button type="button" onClick={nextStep} className="btn btn-primary">
                Next Step →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
