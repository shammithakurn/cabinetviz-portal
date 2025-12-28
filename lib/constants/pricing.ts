// lib/constants/pricing.ts
// Pricing and package constants

/**
 * Package types
 */
export const PACKAGES = {
  BASIC: 'BASIC',
  PROFESSIONAL: 'PROFESSIONAL',
  PARTNER: 'PARTNER',
} as const

export type PackageType = (typeof PACKAGES)[keyof typeof PACKAGES]

/**
 * Package pricing
 */
export const PACKAGE_PRICES: Record<PackageType, number> = {
  BASIC: 99,
  PROFESSIONAL: 199,
  PARTNER: 499, // Per month
}

/**
 * Package features
 */
export const PACKAGE_FEATURES: Record<PackageType, {
  name: string
  price: number
  priceLabel: string
  renders: number | 'unlimited'
  revisions: number | 'unlimited'
  features: string[]
  popular?: boolean
}> = {
  BASIC: {
    name: 'Basic',
    price: 99,
    priceLabel: '$99/project',
    renders: 2,
    revisions: 1,
    features: [
      '2 high-quality 3D renders',
      '1 revision round',
      '2D floor plan',
      'Basic material specs',
      '5 business day delivery',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 199,
    priceLabel: '$199/project',
    renders: 5,
    revisions: 3,
    popular: true,
    features: [
      '5 high-quality 3D renders',
      '3 revision rounds',
      'Detailed 2D drawings',
      'Cut list & material specs',
      'Assembly guide',
      '3 business day delivery',
    ],
  },
  PARTNER: {
    name: 'Partner',
    price: 499,
    priceLabel: '$499/month',
    renders: 'unlimited',
    revisions: 'unlimited',
    features: [
      '5 projects per month',
      'Unlimited renders per project',
      'Unlimited revisions',
      'Priority 2-day delivery',
      'Dedicated support',
      'White-label option',
    ],
  },
}

/**
 * Subscription billing cycles
 */
export const BILLING_CYCLES = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const

export type BillingCycle = (typeof BILLING_CYCLES)[keyof typeof BILLING_CYCLES]

/**
 * Partner subscription limits
 */
export const PARTNER_LIMITS = {
  PROJECTS_PER_MONTH: 5,
  MONTHLY_PRICE: 499,
  YEARLY_PRICE: 4990, // ~2 months free
}

/**
 * Currency settings
 */
export const CURRENCY = {
  CODE: 'NZD',
  SYMBOL: '$',
  LOCALE: 'en-NZ',
}

/**
 * Format price for display
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
  }).format(amount)
}
