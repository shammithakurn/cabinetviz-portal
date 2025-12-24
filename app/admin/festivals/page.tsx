// app/admin/festivals/page.tsx
// Festival Management Dashboard - Control festivals, banners, animations, and custom events

'use client'

import { useState, useEffect } from 'react'

interface Festival {
  id: string
  name: string
  displayName: string
  month?: number
  day?: number
  duration: number
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  animation: string
  intensity: string
  greeting: string
  icon: string
  countries: string[]
  priority: number
  isCalculated?: boolean
  isCustom?: boolean
}

interface FestivalWithDates extends Festival {
  startDate: string
  endDate: string
}

interface CustomFestival {
  id: string
  name: string
  displayName: string
  startDate: string
  endDate: string
  duration: number
  isRecurring: boolean
  colors: { primary: string; secondary: string; accent: string }
  animation: string
  intensity: string
  customAnimation?: AnimationConfig
  greeting: string
  icon: string
  bannerText?: string
  countries: string[]
  priority: number
  isActive: boolean
}

interface AnimationElement {
  id: string
  name: string
  category: string
  emoji?: string
  svgPath?: string
  imageUrl?: string
  description?: string
  tags: string[]
  isBuiltIn: boolean
  defaultProps: AnimationProps
}

interface AnimationProps {
  size: { min: number; max: number }
  speed: { min: number; max: number }
  rotation: boolean
  rotationSpeed: number
  fade: boolean
  fadeStart: number
  swing: boolean
  swingAmount: number
  density: number
  direction: 'down' | 'up'
}

interface AnimationConfig {
  elements: { elementId: string; weight: number }[]
  props: AnimationProps
}

interface ActiveFestival {
  id: string
  name: string
  priority: number
}

interface FestivalSettings {
  enabled: boolean
  showBanner: boolean
  showAnimations: boolean
  defaultCountry: string
  preFestivalDays: number
}

const ANIMATION_TYPES = ['snowfall', 'fireworks', 'confetti', 'hearts', 'diyas', 'leaves', 'lanterns', 'stars', 'custom']
const INTENSITY_LEVELS = ['low', 'medium', 'high']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const COUNTRIES = [
  { code: 'GLOBAL', name: 'Global (All Countries)' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'AE', name: 'UAE' },
  { code: 'SG', name: 'Singapore' },
]

const EMOJI_PICKER = ['🎉', '🎊', '🎄', '🎅', '🎁', '🎆', '🎇', '🧨', '🏮', '🪔', '🌙', '⭐', '🌟', '❄️', '☃️', '🎃', '👻', '💀', '🐰', '🥚', '🌸', '🌺', '💐', '🌹', '❤️', '💕', '💖', '🍀', '☘️', '🦃', '🍂', '🍁', '🎀', '👑', '🏆', '🎂', '🍾', '🥂', '🎈', '🎯', '⚡', '🔔', '🕎', '✡️', '☪️', '🕉️', '✝️', '🙏', '🪷', '🧧', '🥮']

export default function FestivalManagementPage() {
  const [festivals, setFestivals] = useState<FestivalWithDates[]>([])
  const [customFestivals, setCustomFestivals] = useState<CustomFestival[]>([])
  const [animationElements, setAnimationElements] = useState<AnimationElement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'calendar' | 'active' | 'custom' | 'animations' | 'test' | 'settings'>('calendar')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCountry, setSelectedCountry] = useState('GLOBAL')

  // Create/Edit custom festival
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingFestival, setEditingFestival] = useState<CustomFestival | null>(null)
  const [newFestival, setNewFestival] = useState({
    displayName: '',
    startDate: new Date().toISOString().split('T')[0],
    duration: 1,
    isRecurring: false,
    colors: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D' },
    animation: 'confetti',
    intensity: 'medium',
    greeting: '',
    icon: '🎉',
    bannerText: '',
    countries: ['GLOBAL'],
    priority: 50,
  })

  // Animation builder state
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>({
    elements: [],
    props: {
      size: { min: 20, max: 40 },
      speed: { min: 3, max: 8 },
      rotation: true,
      rotationSpeed: 2,
      fade: true,
      fadeStart: 0.8,
      swing: false,
      swingAmount: 20,
      density: 30,
      direction: 'down',
    },
  })
  const [selectedCategory, setSelectedCategory] = useState('FESTIVE')

  // Test mode state
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [testCountry, setTestCountry] = useState('GLOBAL')
  const [testResult, setTestResult] = useState<{
    festival: Festival | null
    allActive: ActiveFestival[]
    country: { code: string; name: string }
    isPreFestival?: boolean
    daysUntil?: number
  } | null>(null)
  const [isTestLoading, setIsTestLoading] = useState(false)

  // Preview state
  const [previewFestival, setPreviewFestival] = useState<Festival | null>(null)
  const [previewStartDate, setPreviewStartDate] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)

  // Settings state
  const [settings, setSettings] = useState<FestivalSettings>({
    enabled: true,
    showBanner: true,
    showAnimations: true,
    defaultCountry: 'GLOBAL',
    preFestivalDays: 3,
  })

  // Load all data
  useEffect(() => {
    loadFestivals()
    loadCustomFestivals()
    loadAnimationElements()
  }, [selectedYear, selectedCountry])

  async function loadFestivals() {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/admin/festivals?year=${selectedYear}&country=${selectedCountry}`)
      const data = await res.json()
      if (data.success) {
        setFestivals(data.festivals)
      }
    } catch (error) {
      console.error('Failed to load festivals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadCustomFestivals() {
    try {
      const res = await fetch('/api/admin/custom-festivals')
      const data = await res.json()
      if (data.success) {
        setCustomFestivals(data.festivals)
      }
    } catch (error) {
      console.error('Failed to load custom festivals:', error)
    }
  }

  async function loadAnimationElements() {
    try {
      const res = await fetch('/api/admin/animation-elements')
      const data = await res.json()
      if (data.success) {
        setAnimationElements(data.elements)
      }
    } catch (error) {
      console.error('Failed to load animation elements:', error)
    }
  }

  async function createCustomFestival() {
    try {
      const res = await fetch('/api/admin/custom-festivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFestival.displayName.toLowerCase().replace(/\s+/g, '-'),
          ...newFestival,
          customAnimation: newFestival.animation === 'custom' ? animationConfig : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCustomFestivals([...customFestivals, data.festival])
        setShowCreateModal(false)
        resetNewFestival()
      }
    } catch (error) {
      console.error('Failed to create festival:', error)
    }
  }

  async function updateCustomFestival() {
    if (!editingFestival) return
    try {
      const res = await fetch('/api/admin/custom-festivals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFestival.id,
          ...newFestival,
          customAnimation: newFestival.animation === 'custom' ? animationConfig : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCustomFestivals(customFestivals.map(f => f.id === editingFestival.id ? data.festival : f))
        setShowCreateModal(false)
        setEditingFestival(null)
        resetNewFestival()
      }
    } catch (error) {
      console.error('Failed to update festival:', error)
    }
  }

  async function deleteCustomFestival(id: string) {
    if (!confirm('Are you sure you want to delete this festival?')) return
    try {
      const res = await fetch(`/api/admin/custom-festivals?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setCustomFestivals(customFestivals.filter(f => f.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete festival:', error)
    }
  }

  async function toggleFestivalActive(festival: CustomFestival) {
    try {
      const res = await fetch('/api/admin/custom-festivals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: festival.id, isActive: !festival.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setCustomFestivals(customFestivals.map(f => f.id === festival.id ? data.festival : f))
      }
    } catch (error) {
      console.error('Failed to toggle festival:', error)
    }
  }

  function resetNewFestival() {
    setNewFestival({
      displayName: '',
      startDate: new Date().toISOString().split('T')[0],
      duration: 1,
      isRecurring: false,
      colors: { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D' },
      animation: 'confetti',
      intensity: 'medium',
      greeting: '',
      icon: '🎉',
      bannerText: '',
      countries: ['GLOBAL'],
      priority: 50,
    })
    setAnimationConfig({
      elements: [],
      props: {
        size: { min: 20, max: 40 },
        speed: { min: 3, max: 8 },
        rotation: true,
        rotationSpeed: 2,
        fade: true,
        fadeStart: 0.8,
        swing: false,
        swingAmount: 20,
        density: 30,
        direction: 'down',
      },
    })
  }

  function editFestival(festival: CustomFestival) {
    setEditingFestival(festival)
    setNewFestival({
      displayName: festival.displayName,
      startDate: festival.startDate.split('T')[0],
      duration: festival.duration,
      isRecurring: festival.isRecurring,
      colors: festival.colors,
      animation: festival.animation,
      intensity: festival.intensity,
      greeting: festival.greeting,
      icon: festival.icon,
      bannerText: festival.bannerText || '',
      countries: festival.countries,
      priority: festival.priority,
    })
    if (festival.customAnimation) {
      setAnimationConfig(festival.customAnimation)
    }
    setShowCreateModal(true)
  }

  async function runTest() {
    setIsTestLoading(true)
    try {
      const res = await fetch(`/api/festivals?date=${testDate}&country=${testCountry}`)
      const data = await res.json()
      if (data.success) {
        setTestResult({
          festival: data.festival,
          allActive: data.allActiveFestivals || [],
          country: data.country,
          isPreFestival: data.isPreFestival,
          daysUntil: data.daysUntil,
        })
      }
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setIsTestLoading(false)
    }
  }

  function handlePreview(festival: Festival | FestivalWithDates | CustomFestival) {
    // Normalize festival to match Festival type for preview
    const normalizedFestival: Festival = {
      id: festival.id,
      name: festival.name || festival.displayName.toLowerCase().replace(/\s+/g, '-'),
      displayName: festival.displayName,
      duration: festival.duration,
      colors: festival.colors,
      animation: festival.animation as Festival['animation'],
      intensity: festival.intensity as Festival['intensity'],
      greeting: festival.greeting,
      icon: festival.icon,
      countries: Array.isArray(festival.countries) ? festival.countries : [festival.countries],
      priority: festival.priority,
    }
    setPreviewFestival(normalizedFestival)
    // Get the start date from either FestivalWithDates or CustomFestival
    const startDate = (festival as FestivalWithDates | CustomFestival).startDate
    if (startDate) {
      setPreviewStartDate(typeof startDate === 'string' ? startDate.split('T')[0] : new Date(startDate).toISOString().split('T')[0])
    } else {
      setPreviewStartDate(testDate)
    }
    setShowPreview(true)
  }

  function generateCalendarDays(month: number) {
    const firstDay = new Date(selectedYear, month - 1, 1)
    const lastDay = new Date(selectedYear, month, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (number | null)[] = []
    for (let i = 0; i < startingDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  // Combine built-in and custom festivals for calendar display
  function getAllFestivalsForCalendar(): (FestivalWithDates | CustomFestival)[] {
    // Convert custom festivals to include proper dates and filter by country
    const activeCustom = customFestivals.filter(f => {
      if (!f.isActive) return false
      // Check if custom festival applies to selected country
      if (f.countries.includes('GLOBAL')) return true
      return f.countries.includes(selectedCountry)
    }).map(f => ({
      ...f,
      // Ensure startDate and endDate are in the right format
      startDate: typeof f.startDate === 'string' ? f.startDate : new Date(f.startDate).toISOString(),
      endDate: typeof f.endDate === 'string' ? f.endDate : new Date(f.endDate).toISOString(),
      isCustom: true,
    }))

    return [...festivals, ...activeCustom]
  }

  function getFestivalsForDay(day: number) {
    if (!day) return []
    const date = new Date(selectedYear, selectedMonth - 1, day)
    const allFestivals = getAllFestivalsForCalendar()
    return allFestivals.filter(f => {
      const start = new Date(f.startDate)
      const end = new Date(f.endDate)
      return date >= start && date <= end
    })
  }

  function getFestivalsForMonth(month: number) {
    const allFestivals = getAllFestivalsForCalendar()
    return allFestivals.filter(f => {
      const start = new Date(f.startDate)
      const end = new Date(f.endDate)
      const monthStart = new Date(selectedYear, month - 1, 1)
      const monthEnd = new Date(selectedYear, month, 0)
      return start <= monthEnd && end >= monthStart
    })
  }

  const filteredElements = animationElements.filter(e => e.category === selectedCategory)

  // Calculate average/dominant props from selected elements' default properties
  function calculateAverageProps(elements: AnimationElement[]): AnimationProps {
    if (elements.length === 0) {
      return {
        size: { min: 20, max: 40 },
        speed: { min: 3, max: 8 },
        rotation: true,
        rotationSpeed: 2,
        fade: true,
        fadeStart: 0.8,
        swing: false,
        swingAmount: 20,
        density: 30,
        direction: 'down',
      }
    }

    // Average numeric values
    const avgSizeMin = Math.round(elements.reduce((sum, e) => sum + e.defaultProps.size.min, 0) / elements.length)
    const avgSizeMax = Math.round(elements.reduce((sum, e) => sum + e.defaultProps.size.max, 0) / elements.length)
    const avgSpeedMin = Math.round(elements.reduce((sum, e) => sum + e.defaultProps.speed.min, 0) / elements.length * 10) / 10
    const avgSpeedMax = Math.round(elements.reduce((sum, e) => sum + e.defaultProps.speed.max, 0) / elements.length * 10) / 10
    const avgRotationSpeed = Math.round(elements.reduce((sum, e) => sum + e.defaultProps.rotationSpeed, 0) / elements.length * 10) / 10
    const avgFadeStart = Math.round(elements.reduce((sum, e) => sum + e.defaultProps.fadeStart, 0) / elements.length * 100) / 100
    const avgSwingAmount = Math.round(elements.reduce((sum, e) => sum + e.defaultProps.swingAmount, 0) / elements.length)
    const avgDensity = Math.round(elements.reduce((sum, e) => sum + e.defaultProps.density, 0) / elements.length)

    // Majority vote for booleans
    const rotationCount = elements.filter(e => e.defaultProps.rotation).length
    const fadeCount = elements.filter(e => e.defaultProps.fade).length
    const swingCount = elements.filter(e => e.defaultProps.swing).length
    const upCount = elements.filter(e => e.defaultProps.direction === 'up').length

    return {
      size: { min: avgSizeMin, max: avgSizeMax },
      speed: { min: avgSpeedMin, max: avgSpeedMax },
      rotation: rotationCount >= elements.length / 2,
      rotationSpeed: avgRotationSpeed,
      fade: fadeCount >= elements.length / 2,
      fadeStart: avgFadeStart,
      swing: swingCount >= elements.length / 2,
      swingAmount: avgSwingAmount,
      density: avgDensity,
      direction: upCount > elements.length / 2 ? 'up' : 'down',
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Festival Management</h1>
        <p className="text-gray-600">
          Manage festival banners, animations, custom events, and greetings.
          <span className="text-amber-600 font-medium"> Pre-festival greetings start 3 days before each festival.</span>
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['calendar', 'active', 'custom', 'animations', 'test', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab === 'calendar' && '📅 Calendar'}
            {tab === 'active' && '🎯 Active Now'}
            {tab === 'custom' && '✨ Custom Events'}
            {tab === 'animations' && '🎬 Elements'}
            {tab === 'test' && '🧪 Test Mode'}
            {tab === 'settings' && '⚙️ Settings'}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Calendar View Tab */}
      {activeTab === 'calendar' && !isLoading && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-900">Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium"
              >
                {[2024, 2025, 2026, 2027].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-900">Country:</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-600 font-medium">
                Total: {festivals.length} festivals
              </span>
            </div>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedMonth(m => m > 1 ? m - 1 : 12)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-bold"
            >
              ← Prev
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </h2>
            <button
              onClick={() => setSelectedMonth(m => m < 12 ? m + 1 : 1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-bold"
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-300">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {generateCalendarDays(selectedMonth).map((day, i) => {
                const dayFestivals = getFestivalsForDay(day as number)
                const isToday = day === new Date().getDate() &&
                  selectedMonth === new Date().getMonth() + 1 &&
                  selectedYear === new Date().getFullYear()

                return (
                  <div
                    key={i}
                    className={`min-h-[100px] p-2 border-b border-r border-gray-200 ${
                      !day ? 'bg-gray-50' : ''
                    } ${isToday ? 'bg-amber-50' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-amber-700' : 'text-gray-800'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayFestivals.slice(0, 3).map(festival => {
                            const isCustom = 'isCustom' in festival && festival.isCustom
                            return (
                              <button
                                key={festival.id}
                                onClick={() => handlePreview(festival)}
                                className={`w-full text-left px-2 py-1 text-xs font-medium rounded truncate hover:opacity-80 transition-opacity border ${isCustom ? 'border-dashed' : ''}`}
                                style={{
                                  backgroundColor: festival.colors.primary + '30',
                                  color: '#1a1a1a',
                                  borderColor: festival.colors.primary + (isCustom ? '80' : '50')
                                }}
                                title={isCustom ? 'Custom Event' : 'Built-in Festival'}
                              >
                                {festival.icon} {festival.displayName}
                                {isCustom && <span className="ml-1 text-[10px]">✨</span>}
                              </button>
                            )
                          })}
                          {dayFestivals.length > 3 && (
                            <div className="text-xs text-gray-600 px-2 font-medium">
                              +{dayFestivals.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Month Festivals List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Festivals This Month</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFestivalsForMonth(selectedMonth).map(festival => {
                const isCustom = 'isCustom' in festival && festival.isCustom
                return (
                  <div
                    key={festival.id}
                    className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${isCustom ? 'border-dashed border-2 border-purple-300' : 'border-gray-300'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: festival.colors.primary + '20' }}
                      >
                        {festival.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {festival.displayName}
                          </h4>
                          {isCustom && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Custom</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(festival.startDate).toLocaleDateString()} - {new Date(festival.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-700 font-medium">
                            {festival.animation}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-700 font-medium">
                            P:{festival.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handlePreview(festival)}
                        className="flex-1 px-3 py-2 text-sm font-medium bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors border border-amber-300"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          const startDate = typeof festival.startDate === 'string'
                            ? festival.startDate.split('T')[0]
                            : new Date(festival.startDate).toISOString().split('T')[0]
                          setTestDate(startDate)
                          setActiveTab('test')
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors border border-gray-300"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                )
              })}
              {getFestivalsForMonth(selectedMonth).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-600">
                  No festivals this month for {selectedCountry}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Now Tab */}
      {activeTab === 'active' && !isLoading && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Currently Active Festivals</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {festivals.filter(f => {
                const now = new Date()
                const start = new Date(f.startDate)
                const end = new Date(f.endDate)
                return now >= start && now <= end
              }).map(festival => (
                <div
                  key={festival.id}
                  className="bg-white rounded-xl border border-gray-300 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                      style={{
                        background: `linear-gradient(135deg, ${festival.colors.primary}, ${festival.colors.secondary})`
                      }}
                    >
                      {festival.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{festival.displayName}</h4>
                      <p className="text-sm text-gray-600">{festival.greeting}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                          {festival.animation} - {festival.intensity}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePreview(festival)}
                      className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
              {festivals.filter(f => {
                const now = new Date()
                const start = new Date(f.startDate)
                const end = new Date(f.endDate)
                return now >= start && now <= end
              }).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-600">
                  No festivals are currently active for {selectedCountry}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming (Next 30 Days) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming (Next 30 Days)</h3>
            <div className="bg-white rounded-xl border border-gray-300 divide-y divide-gray-200">
              {festivals.filter(f => {
                const now = new Date()
                const start = new Date(f.startDate)
                const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
                return start > now && start <= thirtyDays
              }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map(festival => {
                const daysUntil = Math.ceil((new Date(festival.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                const showPreFestivalBadge = daysUntil <= 3

                return (
                  <div key={festival.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                    <div className="text-2xl">{festival.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{festival.displayName}</h4>
                      <p className="text-sm text-gray-600">
                        Starts {new Date(festival.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    {showPreFestivalBadge && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full border border-amber-300">
                        Pre-Festival Active
                      </span>
                    )}
                    <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                      {daysUntil} days
                    </span>
                  </div>
                )
              })}
              {festivals.filter(f => {
                const now = new Date()
                const start = new Date(f.startDate)
                const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
                return start > now && start <= thirtyDays
              }).length === 0 && (
                <div className="p-8 text-center text-gray-600">
                  No upcoming festivals in the next 30 days
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Events Tab */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Custom Festivals & Events</h3>
              <p className="text-sm text-gray-600">Create your own festivals, sales events, or special occasions</p>
            </div>
            <button
              onClick={() => {
                setEditingFestival(null)
                resetNewFestival()
                setShowCreateModal(true)
              }}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>+</span> Create New Event
            </button>
          </div>

          {/* Custom Festivals List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customFestivals.map(festival => (
              <div
                key={festival.id}
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-shadow ${
                  festival.isActive ? 'border-gray-300' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${festival.colors.primary}, ${festival.colors.secondary})`
                    }}
                  >
                    {festival.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">{festival.displayName}</h4>
                      {!festival.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Disabled</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{festival.greeting}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(festival.startDate).toLocaleDateString()}
                      {festival.isRecurring && ' (Yearly)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-700 font-medium">
                    {festival.animation}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-700 font-medium">
                    P:{festival.priority}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full text-gray-700 font-medium">
                    {festival.countries.join(', ')}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handlePreview(festival)}
                    className="flex-1 px-3 py-2 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => editFestival(festival)}
                    className="flex-1 px-3 py-2 text-sm font-medium bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleFestivalActive(festival)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      festival.isActive
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {festival.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => deleteCustomFestival(festival.id)}
                    className="px-3 py-2 text-sm font-medium bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {customFestivals.length === 0 && (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <span className="text-4xl mb-4 block">✨</span>
                <p className="text-gray-700 font-medium">No custom events yet</p>
                <p className="text-sm text-gray-500 mt-1">Create your first custom festival or event</p>
                <button
                  onClick={() => {
                    resetNewFestival()
                    setShowCreateModal(true)
                  }}
                  className="mt-4 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Animation Elements Tab */}
      {activeTab === 'animations' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Animation Elements Library</h3>
            <p className="text-sm text-gray-600 mb-4">
              Browse available animation elements. Use these in custom animations for your festivals.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {['FESTIVE', 'NATURE', 'CELEBRATION', 'RELIGIOUS', 'SEASONAL'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Elements Grid */}
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredElements.map(element => (
              <div
                key={element.id}
                className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group"
                title={element.description}
              >
                <div className="text-3xl mb-2">{element.emoji}</div>
                <p className="text-xs font-medium text-gray-700 truncate">{element.name}</p>
              </div>
            ))}
          </div>

          {/* Animation Types Reference */}
          <div className="bg-white rounded-xl border border-gray-300 p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Built-in Animation Types</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {ANIMATION_TYPES.filter(a => a !== 'custom').map(anim => (
                <div key={anim} className="p-4 bg-gray-100 rounded-lg text-center border border-gray-200">
                  <div className="text-3xl mb-2">
                    {anim === 'snowfall' && '❄️'}
                    {anim === 'fireworks' && '🎆'}
                    {anim === 'confetti' && '🎊'}
                    {anim === 'hearts' && '❤️'}
                    {anim === 'diyas' && '🪔'}
                    {anim === 'leaves' && '🍂'}
                    {anim === 'lanterns' && '🏮'}
                    {anim === 'stars' && '⭐'}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 capitalize">{anim}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {anim === 'snowfall' && 'Gentle falling snow'}
                    {anim === 'fireworks' && 'Bursting celebration'}
                    {anim === 'confetti' && 'Colorful party pieces'}
                    {anim === 'hearts' && 'Floating love hearts'}
                    {anim === 'diyas' && 'Glowing oil lamps'}
                    {anim === 'leaves' && 'Autumn leaves falling'}
                    {anim === 'lanterns' && 'Floating lanterns'}
                    {anim === 'stars' && 'Twinkling stars'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Mode Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🧪</span> Test Festival Detection
            </h3>
            <p className="text-gray-600 mb-6">
              Simulate any date and country to see which festival would be displayed.
              <span className="text-amber-600 font-medium"> Pre-festival wishes start 3 days before.</span>
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Test Date</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Country</label>
                <select
                  value={testCountry}
                  onChange={(e) => setTestCountry(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={runTest}
                  disabled={isTestLoading}
                  className="w-full px-6 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isTestLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <span>🔍</span> Run Test
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Date Shortcuts */}
            <div className="flex flex-wrap gap-2 mb-6 items-center">
              <span className="text-sm font-medium text-gray-700">Quick dates:</span>
              {[
                { label: 'Today', date: new Date().toISOString().split('T')[0] },
                { label: '3 Days Before Xmas', date: `${selectedYear}-12-22` },
                { label: 'Christmas', date: `${selectedYear}-12-25` },
                { label: 'New Year', date: `${selectedYear}-01-01` },
                { label: "Valentine's", date: `${selectedYear}-02-14` },
                { label: 'Diwali 2025', date: '2025-10-20' },
              ].map(shortcut => (
                <button
                  key={shortcut.label}
                  onClick={() => setTestDate(shortcut.date)}
                  className="px-3 py-1.5 text-sm font-medium bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors"
                >
                  {shortcut.label}
                </button>
              ))}
            </div>

            {/* Test Result */}
            {testResult && (
              <div className="border-t border-gray-300 pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Test Results</h4>

                {testResult.festival ? (
                  <div className="space-y-4">
                    {testResult.isPreFestival && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-amber-800 font-medium flex items-center gap-2">
                          <span>⏰</span> Pre-Festival Period - {testResult.daysUntil} day{testResult.daysUntil !== 1 ? 's' : ''} until festival
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          &quot;{testResult.festival.displayName} is {testResult.daysUntil === 1 ? 'tomorrow' : `in ${testResult.daysUntil} days`}!&quot;
                        </p>
                      </div>
                    )}

                    <div
                      className="rounded-xl p-6"
                      style={{
                        background: `linear-gradient(135deg, ${testResult.festival.colors.primary}, ${testResult.festival.colors.secondary})`
                      }}
                    >
                      <div className="text-center text-white">
                        <span className="text-4xl mb-2 block">{testResult.festival.icon}</span>
                        <h3 className="text-xl font-semibold mb-1">{testResult.festival.displayName}</h3>
                        <p className="text-white/90">{testResult.festival.greeting}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Animation Settings</h5>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700">Type: <span className="font-medium text-gray-900">{testResult.festival.animation}</span></p>
                          <p className="text-gray-700">Intensity: <span className="font-medium text-gray-900">{testResult.festival.intensity}</span></p>
                          <p className="text-gray-700">Priority: <span className="font-medium text-gray-900">{testResult.festival.priority}</span></p>
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 mb-2">Color Scheme</h5>
                        <div className="flex gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: testResult.festival.colors.primary }} />
                            <span className="text-xs text-gray-700 font-medium">Primary</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: testResult.festival.colors.secondary }} />
                            <span className="text-xs text-gray-700 font-medium">Secondary</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-100 rounded-xl">
                    <span className="text-4xl mb-2 block">😴</span>
                    <p className="text-gray-700 font-medium">No festival active for this date and country</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {testResult.country.name} on {new Date(testDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Preview Links */}
          <div className="bg-white rounded-xl border border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎮</span> Quick Preview Links
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { id: 'christmas', name: 'Christmas', icon: '🎄', date: '2025-12-25' },
                { id: 'new-year', name: 'New Year', icon: '🎆', date: '2025-01-01' },
                { id: 'valentines', name: "Valentine's", icon: '❤️', date: '2025-02-14' },
                { id: 'diwali', name: 'Diwali', icon: '🪔', date: '2025-10-20', country: 'IN' },
                { id: 'halloween', name: 'Halloween', icon: '🎃', date: '2025-10-31' },
                { id: 'cny', name: 'Chinese NY', icon: '🧧', date: '2025-01-29', country: 'CN' },
              ].map(fest => (
                <a
                  key={fest.id}
                  href={`/?festival_date=${fest.date}&festival_country=${fest.country || 'GLOBAL'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                >
                  <span className="text-2xl">{fest.icon}</span>
                  <span className="font-semibold text-gray-900">{fest.name}</span>
                  <span className="ml-auto text-gray-600 font-medium">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-300 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Festival Display Settings</h3>

            <div className="space-y-6">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Enable Festivals</h4>
                  <p className="text-sm text-gray-600">Show festival banners and animations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Pre-Festival Days */}
              <div className="p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">Pre-Festival Greetings</h4>
                    <p className="text-sm text-gray-600">Show wishes before festival starts</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="7"
                    value={settings.preFestivalDays}
                    onChange={(e) => setSettings({ ...settings, preFestivalDays: parseInt(e.target.value) })}
                    className="flex-1"
                    disabled={!settings.enabled}
                  />
                  <span className="text-lg font-bold text-gray-900 w-20 text-center">
                    {settings.preFestivalDays} days
                  </span>
                </div>
              </div>

              {/* Banner Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Show Banner</h4>
                  <p className="text-sm text-gray-600">Display festival greeting at page top</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showBanner}
                    onChange={(e) => setSettings({ ...settings, showBanner: e.target.checked })}
                    className="sr-only peer"
                    disabled={!settings.enabled}
                  />
                  <div className={`w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600 ${!settings.enabled ? 'opacity-50' : ''}`}></div>
                </label>
              </div>

              {/* Animation Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900">Show Animations</h4>
                  <p className="text-sm text-gray-600">Display floating animations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showAnimations}
                    onChange={(e) => setSettings({ ...settings, showAnimations: e.target.checked })}
                    className="sr-only peer"
                    disabled={!settings.enabled}
                  />
                  <div className={`w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600 ${!settings.enabled ? 'opacity-50' : ''}`}></div>
                </label>
              </div>

              {/* Default Country */}
              <div className="p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Default Country</h4>
                <p className="text-sm text-gray-600 mb-3">Used when geolocation unavailable</p>
                <select
                  value={settings.defaultCountry}
                  onChange={(e) => setSettings({ ...settings, defaultCountry: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  disabled={!settings.enabled}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-300">
              <button className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                Save Settings
              </button>
              <p className="text-xs text-gray-500 mt-2">Settings stored locally. Full persistence coming soon.</p>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Festival Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFestival ? 'Edit Festival' : 'Create New Festival/Event'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Display Name *</label>
                  <input
                    type="text"
                    value={newFestival.displayName}
                    onChange={(e) => setNewFestival({ ...newFestival, displayName: e.target.value })}
                    placeholder="e.g., Summer Sale"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Icon *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFestival.icon}
                      onChange={(e) => setNewFestival({ ...newFestival, icon: e.target.value })}
                      className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-center text-2xl"
                    />
                    <div className="flex-1 flex flex-wrap gap-1 p-2 border border-gray-300 rounded-lg bg-gray-50 max-h-20 overflow-y-auto">
                      {EMOJI_PICKER.slice(0, 20).map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewFestival({ ...newFestival, icon: emoji })}
                          className="text-lg hover:bg-gray-200 rounded p-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Greeting */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Greeting Message *</label>
                <input
                  type="text"
                  value={newFestival.greeting}
                  onChange={(e) => setNewFestival({ ...newFestival, greeting: e.target.value })}
                  placeholder="e.g., Happy Summer Sale!"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                />
              </div>

              {/* Date & Duration */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={newFestival.startDate}
                    onChange={(e) => setNewFestival({ ...newFestival, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newFestival.duration}
                    onChange={(e) => setNewFestival({ ...newFestival, duration: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFestival.isRecurring}
                      onChange={(e) => setNewFestival({ ...newFestival, isRecurring: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Repeat yearly</span>
                  </label>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Colors</label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newFestival.colors.primary}
                      onChange={(e) => setNewFestival({
                        ...newFestival,
                        colors: { ...newFestival.colors, primary: e.target.value }
                      })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newFestival.colors.secondary}
                      onChange={(e) => setNewFestival({
                        ...newFestival,
                        colors: { ...newFestival.colors, secondary: e.target.value }
                      })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">Secondary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newFestival.colors.accent}
                      onChange={(e) => setNewFestival({
                        ...newFestival,
                        colors: { ...newFestival.colors, accent: e.target.value }
                      })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">Accent</span>
                  </div>
                </div>
                {/* Banner Preview - matches actual FestivalBanner component */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Banner Preview:</p>
                  <div
                    className="relative py-3 px-4 text-center shadow-lg rounded-lg overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${newFestival.colors.primary}, ${newFestival.colors.secondary})`
                    }}
                  >
                    {/* Decorative pattern */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
                      }}
                    />

                    <div className="relative flex items-center justify-center gap-3 text-white">
                      {/* Festival Icon */}
                      <span className="text-2xl animate-bounce">{newFestival.icon || '🎉'}</span>

                      {/* Greeting Text */}
                      <span className="font-semibold text-lg tracking-wide">
                        {newFestival.greeting || 'Your greeting here'}
                      </span>

                      {/* Festival Icon (mirrored) */}
                      <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>
                        {newFestival.icon || '🎉'}
                      </span>

                      {/* Dismiss Button (visual only) */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Animated underline */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${newFestival.colors.accent}, transparent)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Animation */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Animation Type</label>
                  <select
                    value={newFestival.animation}
                    onChange={(e) => setNewFestival({ ...newFestival, animation: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    {ANIMATION_TYPES.map(anim => (
                      <option key={anim} value={anim}>
                        {anim.charAt(0).toUpperCase() + anim.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Intensity</label>
                  <select
                    value={newFestival.intensity}
                    onChange={(e) => setNewFestival({ ...newFestival, intensity: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  >
                    {INTENSITY_LEVELS.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Animation Builder - shown only when 'custom' is selected */}
              {newFestival.animation === 'custom' && (
                <div className="border border-amber-300 bg-amber-50 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-amber-800 mb-3">
                    Custom Animation Builder - Select Elements
                  </label>

                  {/* Category tabs */}
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {['FESTIVE', 'NATURE', 'CELEBRATION', 'RELIGIOUS', 'SEASONAL'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          selectedCategory === cat
                            ? 'bg-amber-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Element picker */}
                  <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded-lg border border-gray-200">
                    {animationElements
                      .filter(e => e.category === selectedCategory)
                      .map(element => {
                        const isSelected = animationConfig.elements.some(e => e.elementId === element.id)
                        return (
                          <button
                            key={element.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                // Remove element
                                const newElements = animationConfig.elements.filter(e => e.elementId !== element.id)
                                // Recalculate props from remaining elements
                                if (newElements.length > 0) {
                                  const remainingElements = newElements.map(e =>
                                    animationElements.find(ae => ae.id === e.elementId)
                                  ).filter(Boolean) as AnimationElement[]
                                  const avgProps = calculateAverageProps(remainingElements)
                                  setAnimationConfig({
                                    elements: newElements,
                                    props: avgProps
                                  })
                                } else {
                                  // Reset to defaults if no elements left
                                  setAnimationConfig({
                                    elements: [],
                                    props: {
                                      size: { min: 20, max: 40 },
                                      speed: { min: 3, max: 8 },
                                      rotation: true,
                                      rotationSpeed: 2,
                                      fade: true,
                                      fadeStart: 0.8,
                                      swing: false,
                                      swingAmount: 20,
                                      density: 30,
                                      direction: 'down',
                                    }
                                  })
                                }
                              } else {
                                // Add element and apply its defaults
                                const newElements = [...animationConfig.elements, { elementId: element.id, weight: 50 }]
                                const selectedElements = newElements.map(e =>
                                  animationElements.find(ae => ae.id === e.elementId)
                                ).filter(Boolean) as AnimationElement[]
                                const avgProps = calculateAverageProps(selectedElements)
                                setAnimationConfig({
                                  elements: newElements,
                                  props: avgProps
                                })
                              }
                            }}
                            className={`p-2 text-2xl rounded-lg transition-all ${
                              isSelected
                                ? 'bg-amber-500 ring-2 ring-amber-600 scale-110'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            title={`${element.name} (${element.defaultProps.direction === 'up' ? '↑' : '↓'})`}
                          >
                            {element.emoji}
                          </button>
                        )
                      })}
                  </div>

                  {/* Selected elements preview */}
                  {animationConfig.elements.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Selected Elements ({animationConfig.elements.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {animationConfig.elements.map(elem => {
                          const element = animationElements.find(e => e.id === elem.elementId)
                          return element ? (
                            <span
                              key={elem.elementId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-200 text-amber-900 rounded-full text-sm"
                              title={`Default: ${element.defaultProps.direction === 'up' ? 'floats up' : 'falls down'}, speed ${element.defaultProps.speed.min}-${element.defaultProps.speed.max}`}
                            >
                              {element.emoji} {element.name}
                              <span className="text-[10px] opacity-70">
                                {element.defaultProps.direction === 'up' ? '↑' : '↓'}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newElements = animationConfig.elements.filter(e => e.elementId !== elem.elementId)
                                  if (newElements.length > 0) {
                                    const remainingElements = newElements.map(e =>
                                      animationElements.find(ae => ae.id === e.elementId)
                                    ).filter(Boolean) as AnimationElement[]
                                    setAnimationConfig({
                                      elements: newElements,
                                      props: calculateAverageProps(remainingElements)
                                    })
                                  } else {
                                    setAnimationConfig({
                                      elements: [],
                                      props: {
                                        size: { min: 20, max: 40 },
                                        speed: { min: 3, max: 8 },
                                        rotation: true,
                                        rotationSpeed: 2,
                                        fade: true,
                                        fadeStart: 0.8,
                                        swing: false,
                                        swingAmount: 20,
                                        density: 30,
                                        direction: 'down',
                                      }
                                    })
                                  }
                                }}
                                className="ml-1 text-amber-700 hover:text-amber-900"
                              >
                                ×
                              </button>
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {animationConfig.elements.length === 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      Click on elements above to add them. Smart defaults will be applied automatically based on real-world behavior (e.g., balloons float up, snowflakes drift down).
                    </p>
                  )}

                  {/* Animation properties */}
                  <div className="mt-4 pt-3 border-t border-amber-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Animation Properties:</p>

                    {/* Direction selector */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-600 block mb-1">Direction</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAnimationConfig({
                            ...animationConfig,
                            props: { ...animationConfig.props, direction: 'down' }
                          })}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            animationConfig.props.direction === 'down'
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          ⬇️ Fall Down
                        </button>
                        <button
                          type="button"
                          onClick={() => setAnimationConfig({
                            ...animationConfig,
                            props: { ...animationConfig.props, direction: 'up' }
                          })}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            animationConfig.props.direction === 'up'
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          ⬆️ Float Up
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Auto-set based on selected elements. Override if needed.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Density</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={animationConfig.props.density}
                          onChange={(e) => setAnimationConfig({
                            ...animationConfig,
                            props: { ...animationConfig.props, density: parseInt(e.target.value) }
                          })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Speed</label>
                        <input
                          type="range"
                          min="1"
                          max="15"
                          value={animationConfig.props.speed.max}
                          onChange={(e) => setAnimationConfig({
                            ...animationConfig,
                            props: {
                              ...animationConfig.props,
                              speed: { min: 2, max: parseInt(e.target.value) }
                            }
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={animationConfig.props.rotation}
                          onChange={(e) => setAnimationConfig({
                            ...animationConfig,
                            props: { ...animationConfig.props, rotation: e.target.checked }
                          })}
                        />
                        Rotation
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={animationConfig.props.swing}
                          onChange={(e) => setAnimationConfig({
                            ...animationConfig,
                            props: { ...animationConfig.props, swing: e.target.checked }
                          })}
                        />
                        Swing
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={animationConfig.props.fade}
                          onChange={(e) => setAnimationConfig({
                            ...animationConfig,
                            props: { ...animationConfig.props, fade: e.target.checked }
                          })}
                        />
                        Fade
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Countries & Priority */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Target Countries</label>
                  <select
                    multiple
                    value={newFestival.countries}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      setNewFestival({ ...newFestival, countries: selected })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 h-32"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd for multiple</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Priority (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newFestival.priority}
                    onChange={(e) => setNewFestival({ ...newFestival, priority: parseInt(e.target.value) || 50 })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">Higher = shown first</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingFestival(null)
                  resetNewFestival()
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingFestival ? updateCustomFestival : createCustomFestival}
                disabled={!newFestival.displayName || !newFestival.greeting || !newFestival.icon}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingFestival ? 'Update Festival' : 'Create Festival'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewFestival && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
            {/* Banner Preview - matches actual FestivalBanner */}
            <div className="bg-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-2 text-center">Banner Preview</p>
              <div
                className="relative py-3 px-4 text-center shadow-lg rounded-lg overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${previewFestival.colors.primary}, ${previewFestival.colors.secondary})`
                }}
              >
                {/* Decorative pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
                  }}
                />

                <div className="relative flex items-center justify-center gap-3 text-white">
                  {/* Festival Icon */}
                  <span className="text-2xl animate-bounce">{previewFestival.icon}</span>

                  {/* Greeting Text */}
                  <span className="font-semibold text-lg tracking-wide">
                    {previewFestival.greeting}
                  </span>

                  {/* Festival Icon (mirrored) */}
                  <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>
                    {previewFestival.icon}
                  </span>

                  {/* Dismiss Button (visual only) */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>

                {/* Animated underline */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${previewFestival.colors.accent}, transparent)`,
                  }}
                />
              </div>
            </div>

            {/* Festival Info Card */}
            <div
              className="p-4 text-white text-center"
              style={{
                background: `linear-gradient(135deg, ${previewFestival.colors.primary}40, ${previewFestival.colors.secondary}40)`
              }}
            >
              <span className="text-4xl mb-2 block">{previewFestival.icon}</span>
              <h2 className="text-xl font-bold text-gray-900">{previewFestival.displayName}</h2>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Festival Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 text-gray-900 font-medium">{previewFestival.duration} days</span>
                </div>
                <div>
                  <span className="text-gray-600">Animation:</span>
                  <span className="ml-2 text-gray-900 font-medium capitalize">{previewFestival.animation}</span>
                </div>
                <div>
                  <span className="text-gray-600">Intensity:</span>
                  <span className="ml-2 text-gray-900 font-medium capitalize">{previewFestival.intensity}</span>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <span className="ml-2 text-gray-900 font-medium">{previewFestival.priority}</span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-gray-600 text-sm font-medium">Countries:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {previewFestival.countries.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs font-medium rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href={`/?festival_date=${previewStartDate || testDate}&festival_country=${previewFestival.countries[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  View on Homepage ↗
                </a>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
