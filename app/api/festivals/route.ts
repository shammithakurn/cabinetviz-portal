// app/api/festivals/route.ts
// API endpoint for getting current festival based on date and location

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentFestival, getActiveFestivals } from '@/lib/festivals'
import { getClientIP, getCountryFromIP, getCountryName } from '@/lib/geolocation'

export async function GET(request: Request) {
  try {
    // Get URL parameters for overrides (useful for testing)
    const { searchParams } = new URL(request.url)
    const dateOverride = searchParams.get('date')
    const countryOverride = searchParams.get('country')

    // Determine the date to use
    const date = dateOverride ? new Date(dateOverride) : new Date()

    // Determine the country
    let countryCode = countryOverride?.toUpperCase() || 'GLOBAL'

    // If no country override, try to detect from IP
    if (!countryOverride) {
      const clientIP = getClientIP(request)
      if (clientIP) {
        countryCode = await getCountryFromIP(clientIP)
      }
    }

    // Get the current festival for this country and date
    const festival = getCurrentFestival(countryCode, date)

    // Get all active festivals (for debugging/admin)
    const allActive = getActiveFestivals(countryCode, date)

    return NextResponse.json({
      success: true,
      festival,
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
      },
      { status: 500 }
    )
  }
}
