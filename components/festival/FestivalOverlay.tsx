'use client'

import { useState, useEffect } from 'react'
import type { Festival, AnimationType, AnimationIntensity } from '@/lib/festivals'
import { FestivalBanner } from './FestivalBanner'
import {
  Snowfall,
  Hearts,
  Leaves,
  Diyas,
  Lanterns,
  Stars,
  Fireworks,
  Confetti,
  CustomAnimation,
} from './animations'

interface AnimationConfig {
  elements: { elementId: string; weight: number }[]
  props: {
    size: { min: number; max: number }
    speed: { min: number; max: number }
    rotation: boolean
    rotationSpeed: number
    fade: boolean
    fadeStart: number
    swing: boolean
    swingAmount: number
    density: number
  }
}

interface FestivalOverlayProps {
  festival: Festival | null
  greeting?: string
  showBanner?: boolean
  showAnimations?: boolean
  customAnimationConfig?: AnimationConfig
}

// Map animation types to components (excluding 'custom' which is handled separately)
const AnimationComponents: Record<Exclude<AnimationType, 'custom'>, React.ComponentType<{ intensity: AnimationIntensity }>> = {
  snowfall: Snowfall,
  hearts: Hearts,
  leaves: Leaves,
  diyas: Diyas,
  lanterns: Lanterns,
  stars: Stars,
  fireworks: Fireworks,
  confetti: Confetti,
}

export function FestivalOverlay({
  festival,
  greeting,
  showBanner = true,
  showAnimations = true,
  customAnimationConfig,
}: FestivalOverlayProps) {
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [animationsDisabled, setAnimationsDisabled] = useState(false)

  // Check localStorage for user preferences
  useEffect(() => {
    const bannerKey = festival ? `festival-banner-${festival.id}` : ''
    const animationsKey = 'festival-animations-disabled'

    if (bannerKey && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(bannerKey)
      // Only use stored value if it was set today
      if (dismissed) {
        const dismissedDate = new Date(dismissed).toDateString()
        const today = new Date().toDateString()
        if (dismissedDate === today) {
          setBannerDismissed(true)
        }
      }
    }

    if (typeof window !== 'undefined') {
      setAnimationsDisabled(localStorage.getItem(animationsKey) === 'true')
    }
  }, [festival])

  const handleBannerDismiss = () => {
    setBannerDismissed(true)
    if (festival && typeof window !== 'undefined') {
      localStorage.setItem(`festival-banner-${festival.id}`, new Date().toISOString())
    }
  }

  const toggleAnimations = () => {
    const newValue = !animationsDisabled
    setAnimationsDisabled(newValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem('festival-animations-disabled', String(newValue))
    }
  }

  // If no festival, don't render anything
  if (!festival) {
    return null
  }

  // Check if this is a custom animation type
  const isCustomAnimation = festival.animation === 'custom'
  const AnimationComponent = isCustomAnimation ? null : AnimationComponents[festival.animation as Exclude<AnimationType, 'custom'>]

  return (
    <>
      {/* Festival Banner */}
      {showBanner && !bannerDismissed && (
        <FestivalBanner festival={festival} greeting={greeting} onDismiss={handleBannerDismiss} />
      )}

      {/* Animation Overlay */}
      {showAnimations && !animationsDisabled && isCustomAnimation && (
        <CustomAnimation intensity={festival.intensity} config={customAnimationConfig} />
      )}
      {showAnimations && !animationsDisabled && !isCustomAnimation && AnimationComponent && (
        <AnimationComponent intensity={festival.intensity} />
      )}

      {/* Animation Toggle Button (bottom right corner) */}
      {showAnimations && (
        <button
          onClick={toggleAnimations}
          className="fixed bottom-4 right-4 z-50 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors"
          title={animationsDisabled ? 'Enable animations' : 'Disable animations'}
        >
          {animationsDisabled ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          )}
        </button>
      )}
    </>
  )
}
