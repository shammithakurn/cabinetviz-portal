'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { FestivalOverlay } from './FestivalOverlay'
import type { Festival } from '@/lib/festivals'

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
    direction?: 'down' | 'up'
  }
}

interface FestivalResponse {
  success: boolean
  festival: Festival | null
  customAnimationConfig?: AnimationConfig
  country?: {
    code: string
    name: string
  }
}

interface GreetingResponse {
  success: boolean
  greeting: string | null
}

function FestivalWrapperInner() {
  const [festival, setFestival] = useState<Festival | null>(null)
  const [greeting, setGreeting] = useState<string | undefined>(undefined)
  const [customAnimationConfig, setCustomAnimationConfig] = useState<AnimationConfig | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    async function loadFestival() {
      try {
        // Build API URL with optional overrides from URL params (for testing)
        const params = new URLSearchParams()
        const dateOverride = searchParams.get('festival_date')
        const countryOverride = searchParams.get('festival_country')
        if (dateOverride) params.set('date', dateOverride)
        if (countryOverride) params.set('country', countryOverride)

        const apiUrl = `/api/festivals${params.toString() ? `?${params.toString()}` : ''}`

        // Fetch current festival
        const festivalRes = await fetch(apiUrl)
        const festivalData: FestivalResponse = await festivalRes.json()

        if (festivalData.success && festivalData.festival) {
          setFestival(festivalData.festival)

          // Set custom animation config if available
          if (festivalData.customAnimationConfig) {
            setCustomAnimationConfig(festivalData.customAnimationConfig)
          }

          // Try to get Claude-generated greeting
          try {
            const greetingRes = await fetch(`/api/festivals/greeting?id=${festivalData.festival.id}`)
            const greetingData: GreetingResponse = await greetingRes.json()
            if (greetingData.success && greetingData.greeting) {
              setGreeting(greetingData.greeting)
            }
          } catch {
            // Use default greeting if Claude API fails
          }
        }
      } catch (error) {
        console.error('Failed to load festival:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFestival()
  }, [searchParams])

  // Don't render anything while loading or if no festival
  if (isLoading || !festival) {
    return null
  }

  return (
    <FestivalOverlay
      festival={festival}
      greeting={greeting}
      showBanner={true}
      showAnimations={true}
      customAnimationConfig={customAnimationConfig}
    />
  )
}

export function FestivalWrapper() {
  return (
    <Suspense fallback={null}>
      <FestivalWrapperInner />
    </Suspense>
  )
}
