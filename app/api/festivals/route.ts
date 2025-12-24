// app/api/festivals/route.ts
// API endpoint for getting current festival based on date and location

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentFestivalWithMeta, getActiveFestivals, Festival } from '@/lib/festivals'
import { getClientIP, getCountryFromIP, getCountryName } from '@/lib/geolocation'
import { prisma } from '@/lib/db'

// Helper to get date components for comparison (ignores time)
function getDateComponents(date: Date): { year: number; month: number; day: number } {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate()
  }
}

// Compare dates by components only (ignores time and timezone)
function compareDateOnly(date1: Date, date2: Date): number {
  const d1 = getDateComponents(date1)
  const d2 = getDateComponents(date2)
  if (d1.year !== d2.year) return d1.year - d2.year
  if (d1.month !== d2.month) return d1.month - d2.month
  return d1.day - d2.day
}

// Check if a custom festival is active on a given date
function isCustomFestivalActive(
  festival: { startDate: Date; endDate: Date; isActive: boolean; countries: string },
  date: Date,
  countryCode: string
): boolean {
  if (!festival.isActive) return false

  // Check if date is within range using date-only comparison
  const start = new Date(festival.startDate)
  const end = new Date(festival.endDate)

  // Compare dates by year/month/day only to avoid timezone issues
  const isAfterOrOnStart = compareDateOnly(date, start) >= 0
  const isBeforeOrOnEnd = compareDateOnly(date, end) <= 0

  if (!isAfterOrOnStart || !isBeforeOrOnEnd) return false

  // Check country
  const countries = festival.countries.split(',').map(c => c.trim().toUpperCase())
  if (countries.includes('GLOBAL')) return true
  return countries.includes(countryCode.toUpperCase())
}

export async function GET(request: Request) {
  try {
    // Get URL parameters for overrides (useful for testing)
    const { searchParams } = new URL(request.url)
    const dateOverride = searchParams.get('date')
    const countryOverride = searchParams.get('country')

    // Determine the date to use
    // Parse date string as local date (YYYY-MM-DD format) to avoid timezone issues
    let date: Date
    if (dateOverride) {
      // Parse YYYY-MM-DD as local date by splitting and creating with components
      const [year, month, day] = dateOverride.split('-').map(Number)
      date = new Date(year, month - 1, day, 12, 0, 0) // Noon local time
    } else {
      date = new Date()
    }

    // Determine the country
    let countryCode = countryOverride?.toUpperCase() || 'GLOBAL'

    // If no country override, try to detect from IP
    if (!countryOverride) {
      const clientIP = getClientIP(request)
      if (clientIP) {
        countryCode = await getCountryFromIP(clientIP)
      }
    }

    // Get the current built-in festival with metadata (includes pre-festival info)
    const builtInFestivalMeta = getCurrentFestivalWithMeta(countryCode, date)

    // Check for active custom festivals from database
    const customFestivals = await prisma.customFestival.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    })

    // Find active custom festival for this date/country
    const activeCustomFestival = customFestivals.find(f =>
      isCustomFestivalActive(f, date, countryCode)
    )

    // Determine which festival to show
    // Custom festivals ALWAYS take priority over built-in festivals when active
    // Priority is only used to compare between multiple custom festivals
    let resultFestival: Festival | null = null
    let isPreFestival = false
    let daysUntil: number | undefined
    let preGreeting: string | undefined

    // Parse custom animation config if available
    let customAnimationConfig = null

    if (activeCustomFestival) {
      // Convert custom festival to Festival type
      const colors = JSON.parse(activeCustomFestival.colors)
      const customAsFestival: Festival = {
        id: activeCustomFestival.id,
        name: activeCustomFestival.name,
        displayName: activeCustomFestival.displayName,
        duration: activeCustomFestival.duration,
        colors: colors,
        animation: activeCustomFestival.animation as Festival['animation'],
        intensity: activeCustomFestival.intensity as Festival['intensity'],
        greeting: activeCustomFestival.greeting,
        icon: activeCustomFestival.icon,
        countries: activeCustomFestival.countries.split(',').map(c => c.trim()),
        priority: activeCustomFestival.priority,
      }

      // Parse custom animation config if it exists
      if (activeCustomFestival.customAnimation) {
        try {
          customAnimationConfig = JSON.parse(activeCustomFestival.customAnimation)
        } catch {
          // Invalid JSON, ignore
        }
      }

      // Custom festivals ALWAYS win over built-in festivals
      resultFestival = customAsFestival
      isPreFestival = false
    } else if (builtInFestivalMeta) {
      resultFestival = builtInFestivalMeta.festival
      isPreFestival = builtInFestivalMeta.isPreFestival
      daysUntil = builtInFestivalMeta.daysUntil
      preGreeting = builtInFestivalMeta.preGreeting
    }

    // Get all active built-in festivals (for debugging/admin)
    const allActive = getActiveFestivals(countryCode, date)

    return NextResponse.json({
      success: true,
      festival: resultFestival,
      customAnimationConfig,
      isPreFestival,
      daysUntil,
      preGreeting,
      country: {
        code: countryCode,
        name: getCountryName(countryCode),
      },
      date: date.toISOString(),
      allActiveFestivals: allActive.map((f) => ({
        id: f.id,
        name: f.displayName,
        priority: f.priority,
      })),
    })
  } catch (error) {
    console.error('Festival API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get festival data',
        festival: null,
        isPreFestival: false,
      },
      { status: 500 }
    )
  }
}
