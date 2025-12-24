// app/api/festivals/greeting/route.ts
// API endpoint for getting Claude-generated festival greetings

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentFestival, getFestivalById } from '@/lib/festivals'
import { generateFestivalGreeting, getCachedGreeting } from '@/lib/claude-festival'
import { getClientIP, getCountryFromIP } from '@/lib/geolocation'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const festivalId = searchParams.get('id')
    const dateOverride = searchParams.get('date')
    const countryOverride = searchParams.get('country')

    // Determine the date and country
    const date = dateOverride ? new Date(dateOverride) : new Date()
    let countryCode = countryOverride?.toUpperCase() || 'GLOBAL'

    if (!countryOverride) {
      const clientIP = getClientIP(request)
      if (clientIP) {
        countryCode = await getCountryFromIP(clientIP)
      }
    }

    // Get festival - either by ID or current
    let festival
    if (festivalId) {
      festival = getFestivalById(festivalId)
    } else {
      festival = getCurrentFestival(countryCode, date)
    }

    if (!festival) {
      return NextResponse.json({
        success: true,
        greeting: null,
        message: 'No active festival',
      })
    }

    // Check for cached greeting first
    const cachedGreeting = getCachedGreeting(festival.id, countryCode)
    if (cachedGreeting) {
      return NextResponse.json({
        success: true,
        greeting: cachedGreeting,
        festivalId: festival.id,
        cached: true,
      })
    }

    // Generate new greeting using Claude
    const greeting = await generateFestivalGreeting(festival, countryCode)

    return NextResponse.json({
      success: true,
      greeting,
      festivalId: festival.id,
      cached: false,
    })
  } catch (error) {
    console.error('Greeting API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate greeting',
        greeting: null,
      },
      { status: 500 }
    )
  }
}
