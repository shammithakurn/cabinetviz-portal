// lib/geolocation.ts
// IP-based country detection for festival personalization

// Simple in-memory cache for geolocation results
const geoCache = new Map<string, { country: string; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface GeoResponse {
  country?: string
  countryCode?: string
  country_code?: string
  status?: string
}

/**
 * Get country code from IP address using free geolocation APIs
 * Falls back to 'GLOBAL' if detection fails
 */
export async function getCountryFromIP(ip: string): Promise<string> {
  // Check cache first
  const cached = geoCache.get(ip)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.country
  }

  // Skip for localhost/private IPs
  if (isPrivateIP(ip)) {
    return 'GLOBAL'
  }

  try {
    // Try ip-api.com first (free, no API key, 45 requests/minute)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,status`, {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    })

    if (response.ok) {
      const data: GeoResponse = await response.json()
      if (data.status === 'success' && data.countryCode) {
        const country = data.countryCode.toUpperCase()
        geoCache.set(ip, { country, timestamp: Date.now() })
        return country
      }
    }
  } catch {
    // Silently fail and try backup
  }

  try {
    // Backup: ipapi.co (free, 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/country/`, {
      signal: AbortSignal.timeout(3000),
    })

    if (response.ok) {
      const country = (await response.text()).trim().toUpperCase()
      if (country && country.length === 2) {
        geoCache.set(ip, { country, timestamp: Date.now() })
        return country
      }
    }
  } catch {
    // Silently fail
  }

  // Final fallback
  return 'GLOBAL'
}

/**
 * Extract client IP from request headers
 * Handles various proxy scenarios (Vercel, Cloudflare, etc.)
 */
export function getClientIP(request: Request): string {
  const headers = request.headers

  // Try various headers in order of reliability
  const ipHeaders = [
    'x-real-ip',
    'x-forwarded-for',
    'cf-connecting-ip', // Cloudflare
    'x-vercel-forwarded-for', // Vercel
    'x-client-ip',
    'true-client-ip', // Akamai
  ]

  for (const header of ipHeaders) {
    const value = headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, get the first one
      const ip = value.split(',')[0].trim()
      if (ip && isValidIP(ip)) {
        return ip
      }
    }
  }

  // Fallback - return empty string (will resolve to GLOBAL)
  return ''
}

/**
 * Check if IP is a private/local address
 */
function isPrivateIP(ip: string): boolean {
  if (!ip) return true

  // IPv4 private ranges
  const privateRanges = [
    /^127\./, // localhost
    /^10\./, // Class A private
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Class B private
    /^192\.168\./, // Class C private
    /^169\.254\./, // Link-local
    /^0\./, // Default route
  ]

  // IPv6 localhost and private
  if (ip === '::1' || ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd')) {
    return true
  }

  return privateRanges.some((range) => range.test(ip))
}

/**
 * Basic IP validation
 */
function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number)
    return parts.every((part) => part >= 0 && part <= 255)
  }

  // IPv6 (simplified check)
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/
  return ipv6Regex.test(ip)
}

/**
 * Get country name from country code
 */
export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    GLOBAL: 'Global',
    US: 'United States',
    UK: 'United Kingdom',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    NZ: 'New Zealand',
    IN: 'India',
    CN: 'China',
    JP: 'Japan',
    KR: 'South Korea',
    DE: 'Germany',
    FR: 'France',
    IT: 'Italy',
    ES: 'Spain',
    PT: 'Portugal',
    NL: 'Netherlands',
    BE: 'Belgium',
    BR: 'Brazil',
    MX: 'Mexico',
    AR: 'Argentina',
    SA: 'Saudi Arabia',
    AE: 'United Arab Emirates',
    EG: 'Egypt',
    TR: 'Turkey',
    PK: 'Pakistan',
    BD: 'Bangladesh',
    ID: 'Indonesia',
    MY: 'Malaysia',
    SG: 'Singapore',
    TH: 'Thailand',
    VN: 'Vietnam',
    PH: 'Philippines',
    NG: 'Nigeria',
    ZA: 'South Africa',
    KE: 'Kenya',
    IL: 'Israel',
    IE: 'Ireland',
    HK: 'Hong Kong',
    TW: 'Taiwan',
    NP: 'Nepal',
    FJ: 'Fiji',
    GY: 'Guyana',
    SR: 'Suriname',
    TT: 'Trinidad and Tobago',
    MU: 'Mauritius',
  }

  return countries[code] || code
}

/**
 * Clear geolocation cache (useful for testing)
 */
export function clearGeoCache(): void {
  geoCache.clear()
}
