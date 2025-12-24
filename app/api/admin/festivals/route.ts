// app/api/admin/festivals/route.ts
// API endpoint for festival management in admin dashboard

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { allFestivals, Festival } from '@/lib/festival-data'
import { addDays } from '@/lib/festival-dates'

interface FestivalWithDates extends Festival {
  startDate: string
  endDate: string
  isCalculated: boolean
}

/**
 * Get the start date of a festival for a given year
 */
function getFestivalStartDate(festival: Festival, year: number): Date {
  if (festival.calculateDate) {
    return festival.calculateDate(year)
  }
  if (festival.month && festival.day) {
    return new Date(year, festival.month - 1, festival.day)
  }
  return new Date(year, 0, 1)
}

/**
 * Get the end date of a festival (start date + duration)
 */
function getFestivalEndDate(festival: Festival, year: number): Date {
  const startDate = getFestivalStartDate(festival, year)
  return addDays(startDate, festival.duration - 1)
}

/**
 * Check if a festival applies to a specific country
 */
function festivalAppliesToCountry(festival: Festival, countryCode: string): boolean {
  if (festival.countries.includes('GLOBAL')) {
    return true
  }
  return festival.countries.includes(countryCode.toUpperCase())
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const countryCode = searchParams.get('country')?.toUpperCase() || 'GLOBAL'

    // Filter festivals by country
    const filteredFestivals = allFestivals.filter(f =>
      festivalAppliesToCountry(f, countryCode)
    )

    // Add calculated dates
    const festivalsWithDates: FestivalWithDates[] = filteredFestivals.map(festival => {
      const startDate = getFestivalStartDate(festival, year)
      const endDate = getFestivalEndDate(festival, year)

      return {
        ...festival,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isCalculated: !!festival.calculateDate,
        // Remove the function as it can't be serialized
        calculateDate: undefined,
      } as FestivalWithDates
    })

    // Sort by date
    festivalsWithDates.sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )

    return NextResponse.json({
      success: true,
      festivals: festivalsWithDates,
      year,
      country: countryCode,
      totalCount: festivalsWithDates.length,
    })
  } catch (error) {
    console.error('Festival admin API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch festivals' },
      { status: 500 }
    )
  }
}
