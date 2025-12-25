// app/admin/theme/page.tsx
// Comprehensive WordPress-like theme settings page

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, formatFileSize } from '@/lib/constants'

interface ThemeSetting {
  id: string
  key: string
  value: string
  category: string
  label: string
  type: string
  description?: string
  options?: string
}

type SettingsByCategory = Record<string, ThemeSetting[]>

const categoryLabels: Record<string, { label: string; icon: string; description: string }> = {
  GENERAL: { label: 'General', icon: '⚙️', description: 'Site name, logo, and contact information' },
  IMAGES: { label: 'Images', icon: '🖼️', description: 'Logo, hero image, and social sharing image' },
  PORTFOLIO: { label: 'Portfolio', icon: '📸', description: 'Before/After showcase images and project details' },
  COLORS: { label: 'Colors', icon: '🎨', description: 'Brand colors and color scheme' },
  TYPOGRAPHY: { label: 'Typography', icon: '🔤', description: 'Fonts and text styling' },
  HERO: { label: 'Hero Section', icon: '🦸', description: 'Main banner headline and content' },
  STATS: { label: 'Statistics', icon: '📊', description: 'Numbers displayed in hero section' },
  PROBLEM: { label: 'Problem Section', icon: '😕', description: 'Pain points section content' },
  SERVICES: { label: 'Services', icon: '🛠️', description: 'Services offered section' },
  PRICING: { label: 'Pricing', icon: '💰', description: 'Pricing packages configuration' },
  PROCESS: { label: 'Process', icon: '📋', description: 'How it works steps' },
  TESTIMONIALS: { label: 'Testimonials', icon: '💬', description: 'Customer reviews and quotes' },
  FAQ: { label: 'FAQ', icon: '❓', description: 'Frequently asked questions' },
  CTA: { label: 'Call to Action', icon: '🎯', description: 'Final conversion section' },
  FOOTER: { label: 'Footer', icon: '📄', description: 'Footer content and social links' },
  SEO: { label: 'SEO', icon: '🔍', description: 'Search engine optimization' },
}

const categoryOrder = ['GENERAL', 'IMAGES', 'PORTFOLIO', 'COLORS', 'TYPOGRAPHY', 'HERO', 'STATS', 'PROBLEM', 'SERVICES', 'PRICING', 'PROCESS', 'TESTIMONIALS', 'FAQ', 'CTA', 'FOOTER', 'SEO']

// Image Uploader Component
function ImageUploader({
  value,
  settingKey,
  onChange
}: {
  value: string
  settingKey: string
  onChange: (url: string) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInputValue, setUrlInputValue] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size before upload (see lib/constants.ts to update limit)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${formatFileSize(file.size)}.`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', settingKey.toLowerCase().replace(/_/g, '-'))

      const res = await fetch('/api/admin/images', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onChange(data.url)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this image?')) {
      onChange('')
    }
  }

  const handleUrlSubmit = () => {
    onChange(urlInputValue)
    setShowUrlInput(false)
  }

  return (
    <div className="space-y-4">
      {/* Current Image Preview */}
      {value ? (
        <div className="relative group">
          <div className="relative w-full max-w-md h-48 bg-dark-elevated rounded-xl overflow-hidden border border-border">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23333" width="100" height="100"/><text fill="%23666" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="12">Image Error</text></svg>'
              }}
            />
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-walnut text-white rounded-lg hover:bg-walnut-dark text-sm font-medium flex items-center gap-2"
              >
                <span>🔄</span> Change
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-2 truncate">{value}</p>
        </div>
      ) : (
        /* No Image - Upload Zone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full max-w-md h-48 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-walnut hover:bg-walnut/5 transition-all"
        >
          <div className="text-4xl mb-3">📷</div>
          <p className="text-text-light font-medium">Click to upload image</p>
          <p className="text-xs text-text-muted mt-1">JPG, PNG, GIF, WebP, SVG (max {MAX_FILE_SIZE_MB}MB)</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-walnut text-white rounded-lg hover:bg-walnut-dark text-sm font-medium disabled:opacity-50 flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <span>📤</span> Upload Image
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setUrlInputValue(value)
            setShowUrlInput(!showUrlInput)
          }}
          className="px-4 py-2 bg-dark-elevated text-text-light rounded-lg hover:bg-dark-surface text-sm font-medium border border-border flex items-center gap-2"
        >
          <span>🔗</span> Use URL
        </button>

        {value && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 text-sm font-medium border border-red-900/50 flex items-center gap-2"
          >
            <span>🗑️</span> Remove
          </button>
        )}
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-4 py-2 bg-walnut text-white rounded-lg hover:bg-walnut-dark font-medium"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="px-4 py-2 bg-dark-elevated text-text-light rounded-lg hover:bg-dark-surface border border-border"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {uploadError}
        </div>
      )}
    </div>
  )
}

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<SettingsByCategory>({})
  const [activeCategory, setActiveCategory] = useState('GENERAL')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingJson, setEditingJson] = useState<string | null>(null)
  const [jsonEditorValue, setJsonEditorValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/theme')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to fetch settings')
        return
      }
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => {
      const newSettings = { ...prev }
      for (const category in newSettings) {
        newSettings[category] = newSettings[category].map(s =>
          s.key === key ? { ...s, value } : s
        )
      }
      return newSettings
    })
    setHasChanges(true)
    setSaveMessage(null)
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const allSettings: { key: string; value: string }[] = []
      for (const category in settings) {
        settings[category].forEach(s => {
          allSettings.push({ key: s.key, value: s.value })
        })
      }

      const res = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: allSettings })
      })

      if (res.ok) {
        setHasChanges(false)
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset ALL settings to defaults? This cannot be undone.')) {
      return
    }

    try {
      const res = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      })

      if (res.ok) {
        await fetchSettings()
        setHasChanges(false)
        setSaveMessage({ type: 'success', text: 'Settings reset to defaults!' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to reset settings.' })
    }
  }

  const openJsonEditor = (setting: ThemeSetting) => {
    setEditingJson(setting.key)
    try {
      const parsed = JSON.parse(setting.value)
      setJsonEditorValue(JSON.stringify(parsed, null, 2))
    } catch {
      setJsonEditorValue(setting.value)
    }
  }

  const saveJsonEditor = () => {
    if (!editingJson) return
    try {
      // Validate JSON
      JSON.parse(jsonEditorValue)
      updateSetting(editingJson, jsonEditorValue)
      setEditingJson(null)
      setJsonEditorValue('')
    } catch {
      alert('Invalid JSON format. Please check your syntax.')
    }
  }

  const renderSettingInput = (setting: ThemeSetting) => {
    switch (setting.type) {
      case 'TEXT':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
          />
        )

      case 'TEXTAREA':
        return (
          <textarea
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent resize-y"
          />
        )

      case 'COLOR':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={setting.value}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              className="w-12 h-12 rounded-lg border border-border cursor-pointer"
            />
            <input
              type="text"
              value={setting.value}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              className="flex-1 px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent font-mono text-sm"
              placeholder="#000000"
            />
            <div
              className="w-20 h-12 rounded-lg border border-border"
              style={{ backgroundColor: setting.value }}
            />
          </div>
        )

      case 'NUMBER':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
          />
        )

      case 'SELECT':
        const options = setting.options ? JSON.parse(setting.options) : []
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
          >
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'IMAGE':
        return (
          <ImageUploader
            value={setting.value}
            settingKey={setting.key}
            onChange={(url) => updateSetting(setting.key, url)}
          />
        )

      case 'BOOLEAN':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value === 'true'}
              onChange={(e) => updateSetting(setting.key, e.target.checked ? 'true' : 'false')}
              className="w-5 h-5 rounded border-border bg-dark-elevated text-walnut focus:ring-walnut"
            />
            <span className="text-text-light">Enabled</span>
          </label>
        )

      case 'JSON':
        let preview = ''
        try {
          const parsed = JSON.parse(setting.value)
          if (Array.isArray(parsed)) {
            preview = `Array with ${parsed.length} items`
          } else {
            preview = `Object with ${Object.keys(parsed).length} properties`
          }
        } catch {
          preview = 'Invalid JSON'
        }
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-dark-elevated rounded-lg border border-border">
              <span className="text-text-light">{preview}</span>
              <button
                type="button"
                onClick={() => openJsonEditor(setting)}
                className="px-4 py-2 bg-walnut text-white rounded-lg hover:bg-walnut-dark text-sm font-medium"
              >
                Edit JSON
              </button>
            </div>
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
          />
        )
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 bg-warm-white min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-border border-t-walnut rounded-full animate-spin" />
            <span className="text-text-light">Loading theme settings...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-warm-white min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Settings</h2>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => {
                setIsLoading(true)
                fetchSettings()
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (Object.keys(settings).length === 0) {
    return (
      <div className="p-8 bg-warm-white min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-amber-400 mb-2">No Settings Found</h2>
            <p className="text-amber-300 mb-4">Theme settings have not been initialized yet.</p>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/admin/theme', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reset' })
                  })
                  if (res.ok) {
                    fetchSettings()
                  }
                } catch (err) {
                  console.error('Failed to initialize:', err)
                }
              }}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Initialize Default Settings
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <div className="bg-dark-surface border-b border-border sticky top-0 z-30">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">Theme Settings</h1>
              <p className="text-text-light mt-1">Customize your website appearance and content</p>
            </div>
            <div className="flex items-center gap-3">
              {saveMessage && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  saveMessage.type === 'success'
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-red-900/30 text-red-400'
                }`}>
                  {saveMessage.text}
                </div>
              )}
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 text-text-light hover:text-text hover:bg-dark-elevated rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
              <button
                onClick={saveSettings}
                disabled={!hasChanges || isSaving}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  hasChanges
                    ? 'bg-walnut text-white hover:bg-walnut-dark'
                    : 'bg-dark-elevated text-text-muted cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-dark-surface border-r border-border min-h-[calc(100vh-73px)] sticky top-[73px] self-start">
          <nav className="p-4 space-y-1">
            {categoryOrder.map(category => {
              const info = categoryLabels[category]
              if (!info || !settings[category]) return null
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeCategory === category
                      ? 'bg-walnut/20 text-walnut font-medium'
                      : 'text-text-light hover:bg-dark-elevated'
                  }`}
                >
                  <span className="text-xl">{info.icon}</span>
                  <span>{info.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {categoryOrder.map(category => {
            const info = categoryLabels[category]
            if (!info || !settings[category] || activeCategory !== category) return null

            return (
              <div key={category} className="max-w-3xl">
                {/* Category Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{info.icon}</span>
                    <h2 className="text-2xl font-bold text-text">{info.label}</h2>
                  </div>
                  <p className="text-text-light">{info.description}</p>
                </div>

                {/* Settings Grid */}
                <div className="space-y-6">
                  {category === 'PORTFOLIO' ? (
                    // Special layout for Portfolio - group items together with side-by-side images
                    <>
                      {[1, 2, 3, 4].map(itemNum => {
                        const beforeSetting = settings[category].find(s => s.key === `portfolio_${itemNum}_before`)
                        const afterSetting = settings[category].find(s => s.key === `portfolio_${itemNum}_after`)
                        const titleSetting = settings[category].find(s => s.key === `portfolio_${itemNum}_title`)
                        const descSetting = settings[category].find(s => s.key === `portfolio_${itemNum}_description`)

                        if (!beforeSetting || !afterSetting || !titleSetting || !descSetting) return null

                        return (
                          <div key={itemNum} className="bg-dark-surface rounded-xl p-6 border border-border">
                            <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                              <span className="w-8 h-8 bg-walnut/20 text-walnut rounded-full flex items-center justify-center text-sm font-bold">{itemNum}</span>
                              Portfolio Item {itemNum}
                            </h3>

                            {/* Before/After Images Side by Side */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-semibold text-text mb-2">
                                  Before Image
                                </label>
                                <p className="text-xs text-text-muted mb-3">Sketch, rough plan, or measurements</p>
                                {renderSettingInput(beforeSetting)}
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-text mb-2">
                                  After Image
                                </label>
                                <p className="text-xs text-text-muted mb-3">3D render or final design</p>
                                {renderSettingInput(afterSetting)}
                              </div>
                            </div>

                            {/* Title */}
                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-text mb-1">
                                {titleSetting.label}
                              </label>
                              {renderSettingInput(titleSetting)}
                            </div>

                            {/* Description */}
                            <div>
                              <label className="block text-sm font-semibold text-text mb-1">
                                {descSetting.label}
                              </label>
                              {renderSettingInput(descSetting)}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  ) : (
                    // Default layout for other categories
                    [...settings[category]].sort((a, b) => a.label.localeCompare(b.label)).map(setting => (
                      <div key={setting.key} className="bg-dark-surface rounded-xl p-6 border border-border">
                        <div className="mb-3">
                          <label className="block text-sm font-semibold text-text mb-1">
                            {setting.label}
                          </label>
                          {setting.description && (
                            <p className="text-sm text-text-light">{setting.description}</p>
                          )}
                        </div>
                        {renderSettingInput(setting)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </main>
      </div>

      {/* JSON Editor Modal */}
      {editingJson && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8">
          <div className="bg-dark-surface rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text">Edit JSON Data</h3>
                <p className="text-text-light text-sm mt-1">Edit the raw JSON data for this setting</p>
              </div>
              <button
                onClick={() => { setEditingJson(null); setJsonEditorValue('') }}
                className="p-2 hover:bg-dark-elevated rounded-lg text-text-light hover:text-text"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <textarea
                value={jsonEditorValue}
                onChange={(e) => setJsonEditorValue(e.target.value)}
                className="w-full h-[400px] font-mono text-sm p-4 border border-border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent bg-dark-elevated text-text"
                spellCheck={false}
              />
              <p className="text-xs text-text-muted mt-2">
                Tip: Make sure your JSON is valid. Arrays should be wrapped in [], objects in {'{}'}.
              </p>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <button
                onClick={() => { setEditingJson(null); setJsonEditorValue('') }}
                className="px-6 py-2 text-text-light hover:bg-dark-elevated rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveJsonEditor}
                className="px-6 py-2 bg-walnut text-white rounded-lg hover:bg-walnut-dark font-medium"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-amber-900/30 border border-amber-500/30 rounded-xl p-4 shadow-lg flex items-center gap-4 z-40">
          <span className="text-amber-400 text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-amber-300">You have unsaved changes</p>
            <p className="text-sm text-amber-400/80">{"Don't forget to save before leaving"}</p>
          </div>
          <button
            onClick={saveSettings}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium ml-4"
          >
            Save Now
          </button>
        </div>
      )}
    </div>
  )
}
