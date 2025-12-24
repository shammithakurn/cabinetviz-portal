// lib/festival-dates.ts
// Date calculation utilities for moveable festivals

/**
 * Calculate Western Easter date using the Anonymous Gregorian algorithm
 * This is the most accurate algorithm for calculating Easter
 */
export function calculateEasterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1

  return new Date(year, month - 1, day)
}

/**
 * Calculate Good Friday (2 days before Easter)
 */
export function calculateGoodFriday(year: number): Date {
  const easter = calculateEasterDate(year)
  return new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000)
}

/**
 * Calculate Chinese New Year date
 * Uses a simplified calculation based on lunar calendar approximation
 * Chinese New Year falls between Jan 21 and Feb 20
 */
export function calculateChineseNewYear(year: number): Date {
  // Simplified calculation - actual dates for recent/upcoming years
  const chineseNewYearDates: Record<number, [number, number]> = {
    2024: [2, 10],  // Feb 10, 2024
    2025: [1, 29],  // Jan 29, 2025
    2026: [2, 17],  // Feb 17, 2026
    2027: [2, 6],   // Feb 6, 2027
    2028: [1, 26],  // Jan 26, 2028
    2029: [2, 13],  // Feb 13, 2029
    2030: [2, 3],   // Feb 3, 2030
    2031: [1, 23],  // Jan 23, 2031
    2032: [2, 11],  // Feb 11, 2032
    2033: [1, 31],  // Jan 31, 2033
  }

  if (chineseNewYearDates[year]) {
    const [month, day] = chineseNewYearDates[year]
    return new Date(year, month - 1, day)
  }

  // Fallback approximation for other years
  // Average date is around Feb 5
  return new Date(year, 1, 5)
}

/**
 * Calculate Lantern Festival (15 days after Chinese New Year)
 */
export function calculateLanternFestival(year: number): Date {
  const cny = calculateChineseNewYear(year)
  return new Date(cny.getTime() + 15 * 24 * 60 * 60 * 1000)
}

/**
 * Calculate Diwali date (Festival of Lights)
 * Diwali falls on the new moon day (Amavasya) in the Hindu month of Kartik
 * Usually occurs between mid-October and mid-November
 */
export function calculateDiwaliDate(year: number): Date {
  // Actual Diwali dates for recent/upcoming years
  const diwaliDates: Record<number, [number, number]> = {
    2024: [11, 1],  // Nov 1, 2024
    2025: [10, 20], // Oct 20, 2025
    2026: [11, 8],  // Nov 8, 2026
    2027: [10, 29], // Oct 29, 2027
    2028: [10, 17], // Oct 17, 2028
    2029: [11, 5],  // Nov 5, 2029
    2030: [10, 26], // Oct 26, 2030
    2031: [11, 14], // Nov 14, 2031
    2032: [11, 2],  // Nov 2, 2032
    2033: [10, 22], // Oct 22, 2033
  }

  if (diwaliDates[year]) {
    const [month, day] = diwaliDates[year]
    return new Date(year, month - 1, day)
  }

  // Fallback approximation
  return new Date(year, 10, 1) // Nov 1
}

/**
 * Calculate Holi date (Festival of Colors)
 * Holi falls on the full moon day in the Hindu month of Phalguna
 * Usually occurs in March
 */
export function calculateHoliDate(year: number): Date {
  // Actual Holi dates for recent/upcoming years
  const holiDates: Record<number, [number, number]> = {
    2024: [3, 25],  // Mar 25, 2024
    2025: [3, 14],  // Mar 14, 2025
    2026: [3, 3],   // Mar 3, 2026
    2027: [3, 22],  // Mar 22, 2027
    2028: [3, 11],  // Mar 11, 2028
    2029: [3, 1],   // Mar 1, 2029
    2030: [3, 20],  // Mar 20, 2030
    2031: [3, 9],   // Mar 9, 2031
    2032: [2, 27],  // Feb 27, 2032
    2033: [3, 16],  // Mar 16, 2033
  }

  if (holiDates[year]) {
    const [month, day] = holiDates[year]
    return new Date(year, month - 1, day)
  }

  // Fallback approximation
  return new Date(year, 2, 15) // Mar 15
}

/**
 * Calculate Eid al-Fitr date
 * Eid al-Fitr marks the end of Ramadan
 * The Islamic calendar is lunar, so dates shift by ~11 days each year
 */
export function calculateEidAlFitr(year: number): Date {
  // Actual Eid al-Fitr dates for recent/upcoming years
  const eidDates: Record<number, [number, number]> = {
    2024: [4, 10],  // Apr 10, 2024
    2025: [3, 30],  // Mar 30, 2025
    2026: [3, 20],  // Mar 20, 2026
    2027: [3, 9],   // Mar 9, 2027
    2028: [2, 26],  // Feb 26, 2028
    2029: [2, 14],  // Feb 14, 2029
    2030: [2, 4],   // Feb 4, 2030
    2031: [1, 24],  // Jan 24, 2031
    2032: [1, 14],  // Jan 14, 2032
    2033: [1, 2],   // Jan 2, 2033
  }

  if (eidDates[year]) {
    const [month, day] = eidDates[year]
    return new Date(year, month - 1, day)
  }

  // Very rough approximation - shifts by ~11 days per year
  return new Date(year, 3, 1) // Apr 1
}

/**
 * Calculate Eid al-Adha date
 * Eid al-Adha is ~70 days after Eid al-Fitr
 */
export function calculateEidAlAdha(year: number): Date {
  // Actual Eid al-Adha dates for recent/upcoming years
  const eidDates: Record<number, [number, number]> = {
    2024: [6, 16],  // Jun 16, 2024
    2025: [6, 6],   // Jun 6, 2025
    2026: [5, 27],  // May 27, 2026
    2027: [5, 16],  // May 16, 2027
    2028: [5, 5],   // May 5, 2028
    2029: [4, 24],  // Apr 24, 2029
    2030: [4, 13],  // Apr 13, 2030
    2031: [4, 2],   // Apr 2, 2031
    2032: [3, 22],  // Mar 22, 2032
    2033: [3, 11],  // Mar 11, 2033
  }

  if (eidDates[year]) {
    const [month, day] = eidDates[year]
    return new Date(year, month - 1, day)
  }

  const eidFitr = calculateEidAlFitr(year)
  return new Date(eidFitr.getTime() + 70 * 24 * 60 * 60 * 1000)
}

/**
 * Calculate Hanukkah start date
 * Hanukkah begins on 25 Kislev in the Hebrew calendar
 * Usually falls in late November to late December
 */
export function calculateHanukkahStart(year: number): Date {
  // Actual Hanukkah dates for recent/upcoming years (first day)
  const hanukkahDates: Record<number, [number, number]> = {
    2024: [12, 25], // Dec 25, 2024
    2025: [12, 14], // Dec 14, 2025
    2026: [12, 4],  // Dec 4, 2026
    2027: [12, 24], // Dec 24, 2027
    2028: [12, 12], // Dec 12, 2028
    2029: [12, 1],  // Dec 1, 2029
    2030: [12, 20], // Dec 20, 2030
    2031: [12, 9],  // Dec 9, 2031
    2032: [11, 27], // Nov 27, 2032
    2033: [12, 16], // Dec 16, 2033
  }

  if (hanukkahDates[year]) {
    const [month, day] = hanukkahDates[year]
    return new Date(year, month - 1, day)
  }

  // Fallback approximation
  return new Date(year, 11, 15) // Dec 15
}

/**
 * Calculate Passover start date
 * Passover begins on 15 Nisan in the Hebrew calendar
 * Usually falls in March or April
 */
export function calculatePassoverStart(year: number): Date {
  // Actual Passover dates for recent/upcoming years (first day)
  const passoverDates: Record<number, [number, number]> = {
    2024: [4, 22],  // Apr 22, 2024
    2025: [4, 12],  // Apr 12, 2025
    2026: [4, 1],   // Apr 1, 2026
    2027: [4, 21],  // Apr 21, 2027
    2028: [4, 10],  // Apr 10, 2028
    2029: [3, 30],  // Mar 30, 2029
    2030: [4, 17],  // Apr 17, 2030
    2031: [4, 7],   // Apr 7, 2031
    2032: [3, 27],  // Mar 27, 2032
    2033: [4, 13],  // Apr 13, 2033
  }

  if (passoverDates[year]) {
    const [month, day] = passoverDates[year]
    return new Date(year, month - 1, day)
  }

  // Fallback approximation
  return new Date(year, 3, 15) // Apr 15
}

/**
 * Calculate Mother's Day (2nd Sunday of May - US/Canada/Australia)
 */
export function calculateMothersDayUS(year: number): Date {
  const may1 = new Date(year, 4, 1)
  const dayOfWeek = may1.getDay()
  // Calculate first Sunday
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  // Second Sunday
  const secondSunday = firstSunday + 7
  return new Date(year, 4, secondSunday)
}

/**
 * Calculate Father's Day (3rd Sunday of June - US/Canada/UK)
 */
export function calculateFathersDayUS(year: number): Date {
  const june1 = new Date(year, 5, 1)
  const dayOfWeek = june1.getDay()
  // Calculate first Sunday
  const firstSunday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  // Third Sunday
  const thirdSunday = firstSunday + 14
  return new Date(year, 5, thirdSunday)
}

/**
 * Calculate Thanksgiving Day (4th Thursday of November - US)
 */
export function calculateThanksgivingUS(year: number): Date {
  const nov1 = new Date(year, 10, 1)
  const dayOfWeek = nov1.getDay()
  // Calculate first Thursday (Thursday = 4)
  const firstThursday = dayOfWeek <= 4 ? 5 - dayOfWeek : 12 - dayOfWeek
  // Fourth Thursday
  const fourthThursday = firstThursday + 21
  return new Date(year, 10, fourthThursday)
}

/**
 * Calculate Mid-Autumn Festival (Moon Festival)
 * Falls on the 15th day of the 8th lunar month
 */
export function calculateMidAutumnFestival(year: number): Date {
  // Actual dates for recent/upcoming years
  const midAutumnDates: Record<number, [number, number]> = {
    2024: [9, 17],  // Sep 17, 2024
    2025: [10, 6],  // Oct 6, 2025
    2026: [9, 25],  // Sep 25, 2026
    2027: [9, 15],  // Sep 15, 2027
    2028: [10, 3],  // Oct 3, 2028
    2029: [9, 22],  // Sep 22, 2029
    2030: [9, 12],  // Sep 12, 2030
    2031: [10, 1],  // Oct 1, 2031
    2032: [9, 19],  // Sep 19, 2032
    2033: [9, 8],   // Sep 8, 2033
  }

  if (midAutumnDates[year]) {
    const [month, day] = midAutumnDates[year]
    return new Date(year, month - 1, day)
  }

  // Fallback approximation
  return new Date(year, 8, 20) // Sep 20
}

/**
 * Normalize a date to YYYYMMDD number for comparison (ignores time)
 */
function toDateNumber(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

/**
 * Check if a date falls within a range (inclusive)
 * Uses date-only comparison to avoid timezone issues
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const dateNum = toDateNumber(date)
  const startNum = toDateNumber(start)
  const endNum = toDateNumber(end)
  return dateNum >= startNum && dateNum <= endNum
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
