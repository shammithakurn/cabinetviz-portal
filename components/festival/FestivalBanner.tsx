'use client'

import { useState, useEffect } from 'react'
import type { Festival } from '@/lib/festivals'

interface FestivalBannerProps {
  festival: Festival
  greeting?: string
  onDismiss?: () => void
}

export function FestivalBanner({ festival, greeting, onDismiss }: FestivalBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  // Animate in on mount and set CSS variable for nav offset
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true)
      // Set CSS variable for nav to use
      document.documentElement.style.setProperty('--festival-banner-height', '52px')
    }, 100)
    return () => {
      clearTimeout(timer)
      document.documentElement.style.setProperty('--festival-banner-height', '0px')
    }
  }, [])

  const handleDismiss = () => {
    setIsAnimating(false)
    document.documentElement.style.setProperty('--festival-banner-height', '0px')
    setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, 300)
  }

  if (!isVisible) return null

  const displayGreeting = greeting || festival.greeting

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div
        className="relative py-3 px-4 text-center shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${festival.colors.primary}, ${festival.colors.secondary})`,
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
          <span className="text-2xl animate-bounce">{festival.icon}</span>

          {/* Greeting Text */}
          <span className="font-semibold text-lg tracking-wide">{displayGreeting}</span>

          {/* Festival Icon (mirrored) */}
          <span className="text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>
            {festival.icon}
          </span>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
            aria-label="Dismiss banner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Animated underline */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, ${festival.colors.accent}, transparent)`,
          }}
        />
      </div>
    </div>
  )
}
