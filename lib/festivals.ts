// lib/festivals.ts
// Festival detection logic - determines which festival is active

import { allFestivals, Festival } from './festival-data'
import { addDays, isSameDay, isDateInRange } from './festival-dates'

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
  // Fallback - should never happen if data is correct
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
 * Check if a festival is active on a given date
 */
export function isFestivalActive(festival: Festival, date: Date = new Date()): boolean {
  const year = date.getFullYear()
  const startDate = getFestivalStartDate(festival, year)
  const endDate = getFestivalEndDate(festival, year)

  // Check current year
  if (isDateInRange(date, startDate, endDate)) {
    return true
  }

  // For festivals that span year boundaries (e.g., New Year)
  // Check if the festival from previous year is still active
  if (festival.month === 12 && festival.day && festival.day >= 25) {
    const prevYearStart = getFestivalStartDate(festival, year - 1)
    const prevYearEnd = getFestivalEndDate(festival, year - 1)
    if (isDateInRange(date, prevYearStart, prevYearEnd)) {
      return true
    }
  }

  // Check if the festival from next year starts early (e.g., Chinese New Year can be in Jan)
  if (festival.calculateDate) {
    const nextYearStart = getFestivalStartDate(festival, year + 1)
    const nextYearEnd = getFestivalEndDate(festival, year + 1)
    if (isSameDay(date, nextYearStart) || isDateInRange(date, nextYearStart, nextYearEnd)) {
      return true
    }
  }

  return false
}

/**
 * Check if a festival applies to a specific country
 */
function festivalAppliesToCountry(festival: Festival, countryCode: string): boolean {
  // GLOBAL applies to everyone
  if (festival.countries.includes('GLOBAL')) {
    return true
  }

  // Check if the specific country is in the list
  return festival.countries.includes(countryCode.toUpperCase())
}

/**
 * Get all active festivals for a specific country on a given date
 * Sorted by priority (highest first)
 */
export function getActiveFestivals(countryCode: string = 'GLOBAL', date: Date = new Date()): Festival[] {
  const activeFestivals = allFestivals.filter((festival) => {
    // Check if festival applies to this country
    if (!festivalAppliesToCountry(festival, countryCode)) {
      return false
    }

    // Check if festival is currently active
    return isFestivalActive(festival, date)
  })

  // Sort by priority (highest first)
  return activeFestivals.sort((a, b) => b.priority - a.priority)
}

/**
 * Get the current festival to display
 * Returns the highest priority active festival for the given country
 */
export function getCurrentFestival(countryCode: string = 'GLOBAL', date: Date = new Date()): Festival | null {
  const activeFestivals = getActiveFestivals(countryCode, date)

  if (activeFestivals.length === 0) {
    return null
  }

  // Return highest priority festival
  return activeFestivals[0]
}

/**
 * Get all festivals for a specific country (regardless of whether they're active)
 */
export function getFestivalsForCountry(countryCode: string): Festival[] {
  return allFestivals.filter((festival) => festivalAppliesToCountry(festival, countryCode))
}

/**
 * Get festivals for a specific month (for preview/calendar purposes)
 */
export function getFestivalsForMonth(
  month: number,
  year: number = new Date().getFullYear(),
  countryCode: string = 'GLOBAL'
): Festival[] {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0) // Last day of month

  return allFestivals.filter((festival) => {
    // Check country
    if (!festivalAppliesToCountry(festival, countryCode)) {
      return false
    }

    // Get festival date for this year
    const festivalStart = getFestivalStartDate(festival, year)
    const festivalEnd = getFestivalEndDate(festival, year)

    // Check if festival overlaps with this month
    return festivalStart <= endOfMonth && festivalEnd >= startOfMonth
  })
}

/**
 * Get upcoming festivals (next 30 days)
 */
export function getUpcomingFestivals(countryCode: string = 'GLOBAL', date: Date = new Date()): Festival[] {
  const endDate = addDays(date, 30)
  const upcoming: Festival[] = []

  for (const festival of allFestivals) {
    if (!festivalAppliesToCountry(festival, countryCode)) {
      continue
    }

    const year = date.getFullYear()
    const festivalStart = getFestivalStartDate(festival, year)
    const festivalEnd = getFestivalEndDate(festival, year)

    // Check if festival starts within the next 30 days
    if (festivalStart > date && festivalStart <= endDate) {
      upcoming.push(festival)
    }
    // Also check next year for festivals at the start of year
    else if (festivalStart.getMonth() < date.getMonth()) {
      const nextYearStart = getFestivalStartDate(festival, year + 1)
      if (nextYearStart > date && nextYearStart <= endDate) {
        upcoming.push(festival)
      }
    }
  }

  return upcoming.sort((a, b) => {
    const aDate = getFestivalStartDate(a, date.getFullYear())
    const bDate = getFestivalStartDate(b, date.getFullYear())
    return aDate.getTime() - bDate.getTime()
  })
}

/**
 * Get festival by ID
 */
export function getFestivalById(id: string): Festival | undefined {
  return allFestivals.find((f) => f.id === id)
}

/**
 * Debug: Get all festivals with their dates for a specific year
 */
export function getAllFestivalsWithDates(year: number = new Date().getFullYear()): Array<{
  festival: Festival
  startDate: Date
  endDate: Date
}> {
  return allFestivals.map((festival) => ({
    festival,
    startDate: getFestivalStartDate(festival, year),
    endDate: getFestivalEndDate(festival, year),
  }))
}

// Re-export types and constants
export type { Festival, AnimationType, AnimationIntensity } from './festival-data'
export { allFestivals, TOTAL_FESTIVALS } from './festival-data'
