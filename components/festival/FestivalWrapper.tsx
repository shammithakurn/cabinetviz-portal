'use client'

import { useEffect, useState } from 'react'
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

export function FestivalWrapper() {
  const [festival, setFestival] = useState<Festival | null>(null)
  const [greeting, setGreeting] = useState<string | undefined>(undefined)
  const [customAnimationConfig, setCustomAnimationConfig] = useState<AnimationConfig | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    let cancelled = false

    async function loadFestival() {
      try {
        // Get URL params for testing overrides
        const urlParams = new URLSearchParams(window.location.search)
        const dateOverride = urlParams.get('festival_date')
        const countryOverride = urlParams.get('festival_country')

        // Build API URL with optional overrides from URL params (for testing)
        const params = new URLSearchParams()

        if (dateOverride) {
          params.set('date', dateOverride)
        } else {
          // Always send the client's local date to avoid server timezone issues
          const now = new Date()
          const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
          params.set('date', localDate)
        }

        if (countryOverride) params.set('country', countryOverride)

        const apiUrl = `/api/festivals?${params.toString()}`

        // Fetch current festival
        const festivalRes = await fetch(apiUrl)

        if (cancelled) return

        if (!festivalRes.ok) {
          console.error('Festival API returned error:', festivalRes.status, festivalRes.statusText)
          setIsLoading(false)
          return
        }

        const festivalData: FestivalResponse = await festivalRes.json()

        if (cancelled) return

        if (festivalData.success && festivalData.festival) {
          setFestival(festivalData.festival)

          // Set custom animation config if available
          if (festivalData.customAnimationConfig) {
            setCustomAnimationConfig(festivalData.customAnimationConfig)
          }

          // Try to get Claude-generated greeting
          try {
            const greetingRes = await fetch(`/api/festivals/greeting?id=${festivalData.festival.id}`)
            if (!cancelled) {
              const greetingData: GreetingResponse = await greetingRes.json()
              if (greetingData.success && greetingData.greeting) {
                setGreeting(greetingData.greeting)
              }
            }
          } catch {
            // Use default greeting if Claude API fails
          }
        }
      } catch (err) {
        console.error('Failed to load festival:', err)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadFestival()

    return () => {
      cancelled = true
    }
  }, [isMounted])

  // Don't render anything on server or while loading
  if (!isMounted || isLoading || !festival) {
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
