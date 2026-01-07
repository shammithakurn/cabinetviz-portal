// lib/constants/pricing.ts
// Pricing and package constants for CabinetViz
// Integrated with Stripe for payment processing

// ============================================
// CURRENCY SETTINGS
// ============================================

export const CURRENCY = {
  CODE: 'NZD',
  SYMBOL: '$',
  LOCALE: 'en-NZ',
} as const

// Stripe requires amounts in smallest currency unit (cents)
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
  }).format(amount)
}

// ============================================
// ONE-TIME SERVICE PACKAGES
// ============================================

export const ONE_TIME_PACKAGES = {
  BASIC: 'BASIC',
  PROFESSIONAL: 'PROFESSIONAL',
  PREMIUM: 'PREMIUM',
} as const

export type OneTimePackageType = (typeof ONE_TIME_PACKAGES)[keyof typeof ONE_TIME_PACKAGES]

export interface OneTimePackage {
  id: OneTimePackageType
  name: string
  description: string
  price: number
  priceLabel: string
  stripePriceId: string | null // Set from environment variable
  renders: number
  revisions: number
  deliveryDays: number
  features: string[]
  popular?: boolean
}

// Pricing for one-time kitchen visualization packages
export const ONE_TIME_PACKAGE_DETAILS: Record<OneTimePackageType, OneTimePackage> = {
  BASIC: {
    id: 'BASIC',
    name: 'Kitchen Basic',
    description: 'Perfect for single kitchen projects',
    price: 79,
    priceLabel: '$79',
    stripePriceId: process.env.STRIPE_PRICE_BASIC || null,
    renders: 1,
    revisions: 1,
    deliveryDays: 5,
    features: [
      '1 Kitchen visualization',
      '2D Elevation views',
      '2D Top view',
      '3D View',
      '1 revision round',
      '5 business day delivery',
    ],
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: 'Kitchen Professional',
    description: 'Best value for contractors',
    price: 199,
    priceLabel: '$199',
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || null,
    renders: 4,
    revisions: 2,
    deliveryDays: 3,
    popular: true,
    features: [
      '4 Kitchen visualizations',
      '2D Elevation views',
      '2D Top view',
      '3D View',
      '2 revision rounds',
      'Priority support',
      '3 business day delivery',
    ],
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Kitchen Premium',
    description: 'For builders & designers',
    price: 499,
    priceLabel: '$499',
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM || null,
    renders: 10,
    revisions: 5,
    deliveryDays: 2,
    features: [
      '10 Kitchen visualizations',
      '2D Elevation views',
      '2D Top view',
      '3D View',
      'Unlimited revisions',
      'Priority delivery',
      'Dedicated project manager',
      '2 business day delivery',
    ],
  },
}

// ============================================
// SUBSCRIPTION PLANS
// ============================================

export const SUBSCRIPTION_PLANS = {
  STARTER: 'STARTER',
  PRO: 'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const

export type SubscriptionPlanType = (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS]

export const BILLING_CYCLES = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const

export type BillingCycle = (typeof BILLING_CYCLES)[keyof typeof BILLING_CYCLES]

export interface SubscriptionPlan {
  id: SubscriptionPlanType
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number // Yearly price (typically discounted)
  yearlyMonthlyEquivalent: number // What the monthly price works out to when billed yearly
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  projectsPerMonth: number
  rendersPerProject: number | 'unlimited'
  revisionsPerProject: number | 'unlimited'
  features: string[]
  popular?: boolean
}

// Subscription plans for ongoing cabinet visualization services
export const SUBSCRIPTION_PLAN_DETAILS: Record<SubscriptionPlanType, SubscriptionPlan> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    description: 'For small businesses getting started',
    monthlyPrice: 149,
    yearlyPrice: 1490, // ~2 months free
    yearlyMonthlyEquivalent: 124,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || null,
    stripePriceIdYearly: process.env.STRIPE_PRICE_STARTER_YEARLY || null,
    projectsPerMonth: 2,
    rendersPerProject: 3,
    revisionsPerProject: 2,
    features: [
      '2 projects per month',
      '3 renders per project',
      '2 revisions per project',
      'Standard 4-day delivery',
      'Email support',
    ],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro',
    description: 'For growing cabinet businesses',
    monthlyPrice: 349,
    yearlyPrice: 3490, // ~2 months free
    yearlyMonthlyEquivalent: 291,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || null,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PRO_YEARLY || null,
    projectsPerMonth: 5,
    rendersPerProject: 'unlimited',
    revisionsPerProject: 5,
    popular: true,
    features: [
      '5 projects per month',
      'Unlimited renders per project',
      '5 revisions per project',
      'Priority 2-day delivery',
      'Phone & email support',
      'White-label option',
    ],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'For high-volume cabinet makers',
    monthlyPrice: 699,
    yearlyPrice: 6990, // ~2 months free
    yearlyMonthlyEquivalent: 583,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || null,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || null,
    projectsPerMonth: 15,
    rendersPerProject: 'unlimited',
    revisionsPerProject: 'unlimited',
    features: [
      '15 projects per month',
      'Unlimited renders per project',
      'Unlimited revisions',
      'Express 1-day delivery',
      'Dedicated account manager',
      'White-label with custom branding',
      'API access',
      'Priority queue',
    ],
  },
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the Stripe price ID for a one-time package
 */
export function getOneTimePriceId(packageType: OneTimePackageType): string | null {
  return ONE_TIME_PACKAGE_DETAILS[packageType]?.stripePriceId || null
}

/**
 * Get the Stripe price ID for a subscription plan
 */
export function getSubscriptionPriceId(
  planType: SubscriptionPlanType,
  billingCycle: BillingCycle
): string | null {
  const plan = SUBSCRIPTION_PLAN_DETAILS[planType]
  if (!plan) return null

  return billingCycle === 'YEARLY'
    ? plan.stripePriceIdYearly
    : plan.stripePriceIdMonthly
}

/**
 * Get price for a subscription based on billing cycle
 */
export function getSubscriptionPrice(
  planType: SubscriptionPlanType,
  billingCycle: BillingCycle
): number {
  const plan = SUBSCRIPTION_PLAN_DETAILS[planType]
  if (!plan) return 0

  return billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice
}

/**
 * Calculate yearly savings compared to monthly billing
 */
export function getYearlySavings(planType: SubscriptionPlanType): number {
  const plan = SUBSCRIPTION_PLAN_DETAILS[planType]
  if (!plan) return 0

  const yearlyIfMonthly = plan.monthlyPrice * 12
  return yearlyIfMonthly - plan.yearlyPrice
}

/**
 * Get all one-time packages as an array (for rendering)
 */
export function getOneTimePackagesArray(): OneTimePackage[] {
  return Object.values(ONE_TIME_PACKAGE_DETAILS)
}

/**
 * Get all subscription plans as an array (for rendering)
 */
export function getSubscriptionPlansArray(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLAN_DETAILS)
}

// ============================================
// LEGACY EXPORTS (for backwards compatibility)
// ============================================

// Map old PACKAGES to new structure
export const PACKAGES = {
  BASIC: 'BASIC',
  PROFESSIONAL: 'PROFESSIONAL',
  PARTNER: 'PRO', // Map old PARTNER to new PRO
} as const

export type PackageType = (typeof PACKAGES)[keyof typeof PACKAGES]

export const PACKAGE_PRICES: Record<string, number> = {
  BASIC: 79,
  PROFESSIONAL: 199,
  PARTNER: 349, // Now maps to PRO subscription
}

export const PACKAGE_FEATURES = {
  BASIC: ONE_TIME_PACKAGE_DETAILS.BASIC,
  PROFESSIONAL: ONE_TIME_PACKAGE_DETAILS.PROFESSIONAL,
  PARTNER: {
    ...SUBSCRIPTION_PLAN_DETAILS.PRO,
    price: SUBSCRIPTION_PLAN_DETAILS.PRO.monthlyPrice,
    priceLabel: `$${SUBSCRIPTION_PLAN_DETAILS.PRO.monthlyPrice}/month`,
  },
}

export const PARTNER_LIMITS = {
  PROJECTS_PER_MONTH: SUBSCRIPTION_PLAN_DETAILS.PRO.projectsPerMonth,
  MONTHLY_PRICE: SUBSCRIPTION_PLAN_DETAILS.PRO.monthlyPrice,
  YEARLY_PRICE: SUBSCRIPTION_PLAN_DETAILS.PRO.yearlyPrice,
}
