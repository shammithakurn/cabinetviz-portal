'use client'

import { useState, useRef, useCallback } from 'react'

interface BeforeAfterSliderProps {
  beforeIcon: string
  beforeLabel: string
  afterIcon: string
  title: string
  description: string
}

export default function BeforeAfterSlider({
  beforeIcon,
  beforeLabel,
  afterIcon,
  title,
  description,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }, [updateSliderPosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    updateSliderPosition(e.clientX)
  }, [isDragging, updateSliderPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    updateSliderPosition(e.touches[0].clientX)
  }, [updateSliderPosition])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    updateSliderPosition(e.touches[0].clientX)
  }, [isDragging, updateSliderPosition])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  return (
    <div className="rounded-3xl overflow-hidden shadow-medium transition-transform duration-300 hover:scale-[1.02]">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] overflow-hidden cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Before Side */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center gap-4">
          <div className="text-7xl opacity-50">{beforeIcon}</div>
          <p className="text-gray-500 font-medium">{beforeLabel}</p>
        </div>

        {/* After Side */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100 flex items-center justify-center"
          style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        >
          <div className="text-7xl">{afterIcon}</div>
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white z-10"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-walnut" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none z-20">
          <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
            Before
          </span>
          <span className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
            After
          </span>
        </div>

        {/* Instruction overlay (shows briefly) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 animate-pulse">
            Drag to compare
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-6">
        <h4 className="text-lg font-display font-semibold text-charcoal mb-2">{title}</h4>
        <p className="text-text-light text-sm">{description}</p>
      </div>
    </div>
  )
}
