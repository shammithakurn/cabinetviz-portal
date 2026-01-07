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
// PACKAGE CATEGORIES
// ============================================

export const PACKAGE_CATEGORIES = {
  KITCHEN: 'KITCHEN',
  WARDROBE: 'WARDROBE',
} as const

export type PackageCategory = (typeof PACKAGE_CATEGORIES)[keyof typeof PACKAGE_CATEGORIES]

// ============================================
// KITCHEN PACKAGES
// ============================================

export const KITCHEN_PACKAGES = {
  BASIC: 'KITCHEN_BASIC',
  PROFESSIONAL: 'KITCHEN_PROFESSIONAL',
  PREMIUM: 'KITCHEN_PREMIUM',
} as const

export type KitchenPackageType = (typeof KITCHEN_PACKAGES)[keyof typeof KITCHEN_PACKAGES]

export interface Package {
  id: string
  category: PackageCategory
  name: string
  description: string
  price: number
  priceLabel: string
  stripePriceId: string | null
  units: number // Number of kitchens/wardrobes
  unitLabel: string // "Kitchen" or "Wardrobe"
  revisions: number | 'unlimited'
  deliveryDays: number
  features: string[]
  popular?: boolean
  perUnit?: boolean // For bulk pricing like wardrobes
}

export const KITCHEN_PACKAGE_DETAILS: Record<KitchenPackageType, Package> = {
  KITCHEN_BASIC: {
    id: 'KITCHEN_BASIC',
    category: 'KITCHEN',
    name: 'Kitchen Basic',
    description: 'Perfect for single kitchen projects',
    price: 79,
    priceLabel: '$79',
    stripePriceId: process.env.STRIPE_PRICE_KITCHEN_BASIC || null,
    units: 1,
    unitLabel: 'Kitchen',
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
  KITCHEN_PROFESSIONAL: {
    id: 'KITCHEN_PROFESSIONAL',
    category: 'KITCHEN',
    name: 'Kitchen Professional',
    description: 'Best value for contractors',
    price: 199,
    priceLabel: '$199',
    stripePriceId: process.env.STRIPE_PRICE_KITCHEN_PROFESSIONAL || null,
    units: 4,
    unitLabel: 'Kitchen',
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
  KITCHEN_PREMIUM: {
    id: 'KITCHEN_PREMIUM',
    category: 'KITCHEN',
    name: 'Kitchen Premium',
    description: 'For builders & designers',
    price: 499,
    priceLabel: '$499',
    stripePriceId: process.env.STRIPE_PRICE_KITCHEN_PREMIUM || null,
    units: 10,
    unitLabel: 'Kitchen',
    revisions: 'unlimited',
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
// WARDROBE PACKAGES
// ============================================

export const WARDROBE_PACKAGES = {
  SINGLE_WALL: 'WARDROBE_SINGLE_WALL',
  MULTI_WALL: 'WARDROBE_MULTI_WALL',
  BULK: 'WARDROBE_BULK',
} as const

export type WardrobePackageType = (typeof WARDROBE_PACKAGES)[keyof typeof WARDROBE_PACKAGES]

export const WARDROBE_PACKAGE_DETAILS: Record<WardrobePackageType, Package> = {
  WARDROBE_SINGLE_WALL: {
    id: 'WARDROBE_SINGLE_WALL',
    category: 'WARDROBE',
    name: 'Single Wall Wardrobe',
    description: 'Perfect for single wall wardrobe',
    price: 20,
    priceLabel: '$20',
    stripePriceId: process.env.STRIPE_PRICE_WARDROBE_SINGLE || null,
    units: 1,
    unitLabel: 'Wardrobe',
    revisions: 1,
    deliveryDays: 3,
    features: [
      '1 Wardrobe visualization',
      '2D Elevation views',
      '2D Top view',
      '3D View',
      '1 revision round',
      '3 business day delivery',
    ],
  },
  WARDROBE_MULTI_WALL: {
    id: 'WARDROBE_MULTI_WALL',
    category: 'WARDROBE',
    name: 'Multi Wall Wardrobe',
    description: 'Perfect for multi wall wardrobe',
    price: 40,
    priceLabel: '$40',
    stripePriceId: process.env.STRIPE_PRICE_WARDROBE_MULTI || null,
    units: 1,
    unitLabel: 'Wardrobe',
    revisions: 1,
    deliveryDays: 3,
    features: [
      '1 Multi-wall wardrobe',
      '2D Elevation views',
      '2D Top view',
      '3D View',
      '1 revision round',
      '3 business day delivery',
    ],
  },
  WARDROBE_BULK: {
    id: 'WARDROBE_BULK',
    category: 'WARDROBE',
    name: 'Bulk Wardrobes (5+)',
    description: 'Best value for bulk wardrobe projects',
    price: 10,
    priceLabel: '$10/each',
    stripePriceId: process.env.STRIPE_PRICE_WARDROBE_BULK || null,
    units: 5,
    unitLabel: 'Wardrobe',
    revisions: 1,
    deliveryDays: 5,
    perUnit: true,
    popular: true,
    features: [
      '5+ Wardrobe visualizations',
      '$10 per wardrobe',
      '2D Elevation views',
      '2D Top view',
      '3D View',
      'Bulk discount pricing',
      '5 business day delivery',
    ],
  },
}

// ============================================
// COMBINED PACKAGE ACCESS
// ============================================

export type AllPackageType = KitchenPackageType | WardrobePackageType

export const ALL_PACKAGES = {
  ...KITCHEN_PACKAGES,
  ...WARDROBE_PACKAGES,
} as const

export const ALL_PACKAGE_DETAILS: Record<AllPackageType, Package> = {
  ...KITCHEN_PACKAGE_DETAILS,
  ...WARDROBE_PACKAGE_DETAILS,
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all kitchen packages as an array
 */
export function getKitchenPackagesArray(): Package[] {
  return Object.values(KITCHEN_PACKAGE_DETAILS)
}

/**
 * Get all wardrobe packages as an array
 */
export function getWardrobePackagesArray(): Package[] {
  return Object.values(WARDROBE_PACKAGE_DETAILS)
}

/**
 * Get all packages as an array
 */
export function getAllPackagesArray(): Package[] {
  return Object.values(ALL_PACKAGE_DETAILS)
}

/**
 * Get packages by category
 */
export function getPackagesByCategory(category: PackageCategory): Package[] {
  return getAllPackagesArray().filter(pkg => pkg.category === category)
}

/**
 * Get package by ID
 */
export function getPackageById(id: string): Package | undefined {
  return ALL_PACKAGE_DETAILS[id as AllPackageType]
}

/**
 * Get the Stripe price ID for a package
 */
export function getPackagePriceId(packageId: string): string | null {
  const pkg = getPackageById(packageId)
  return pkg?.stripePriceId || null
}

// ============================================
// LEGACY EXPORTS (for backwards compatibility)
// ============================================

// Map old package types to new structure
export const ONE_TIME_PACKAGES = {
  BASIC: 'KITCHEN_BASIC',
  PROFESSIONAL: 'KITCHEN_PROFESSIONAL',
  PREMIUM: 'KITCHEN_PREMIUM',
} as const

export type OneTimePackageType = 'BASIC' | 'PROFESSIONAL' | 'PREMIUM'

export interface OneTimePackage {
  id: OneTimePackageType
  name: string
  description: string
  price: number
  priceLabel: string
  stripePriceId: string | null
  renders: number
  revisions: number
  deliveryDays: number
  features: string[]
  popular?: boolean
}

// Legacy mapping for existing code
export const ONE_TIME_PACKAGE_DETAILS: Record<OneTimePackageType, OneTimePackage> = {
  BASIC: {
    id: 'BASIC',
    name: KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.name,
    description: KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.description,
    price: KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.price,
    priceLabel: KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.priceLabel,
    stripePriceId: KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.stripePriceId,
    renders: KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.units,
    revisions: typeof KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.revisions === 'number'
      ? KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.revisions : 99,
    deliveryDays: KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.deliveryDays,
    features: KITCHEN_PACKAGE_DETAILS.KITCHEN_BASIC.features,
  },
  PROFESSIONAL: {
    id: 'PROFESSIONAL',
    name: KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.name,
    description: KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.description,
    price: KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.price,
    priceLabel: KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.priceLabel,
    stripePriceId: KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.stripePriceId,
    renders: KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.units,
    revisions: typeof KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.revisions === 'number'
      ? KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.revisions : 99,
    deliveryDays: KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.deliveryDays,
    features: KITCHEN_PACKAGE_DETAILS.KITCHEN_PROFESSIONAL.features,
    popular: true,
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.name,
    description: KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.description,
    price: KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.price,
    priceLabel: KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.priceLabel,
    stripePriceId: KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.stripePriceId,
    renders: KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.units,
    revisions: typeof KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.revisions === 'number'
      ? KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.revisions : 99,
    deliveryDays: KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.deliveryDays,
    features: KITCHEN_PACKAGE_DETAILS.KITCHEN_PREMIUM.features,
  },
}

export function getOneTimePackagesArray(): OneTimePackage[] {
  return Object.values(ONE_TIME_PACKAGE_DETAILS)
}

export function getOneTimePriceId(packageType: OneTimePackageType): string | null {
  return ONE_TIME_PACKAGE_DETAILS[packageType]?.stripePriceId || null
}

// ============================================
// SUBSCRIPTION PLANS (kept for future use)
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
  yearlyPrice: number
  yearlyMonthlyEquivalent: number
  stripePriceIdMonthly: string | null
  stripePriceIdYearly: string | null
  projectsPerMonth: number
  rendersPerProject: number | 'unlimited'
  revisionsPerProject: number | 'unlimited'
  features: string[]
  popular?: boolean
}

export const SUBSCRIPTION_PLAN_DETAILS: Record<SubscriptionPlanType, SubscriptionPlan> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter',
    description: 'For small businesses getting started',
    monthlyPrice: 149,
    yearlyPrice: 1490,
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
    yearlyPrice: 3490,
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
    yearlyPrice: 6990,
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

export function getSubscriptionPlansArray(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLAN_DETAILS)
}

export function getSubscriptionPriceId(
  planType: SubscriptionPlanType,
  billingCycle: BillingCycle
): string | null {
  const plan = SUBSCRIPTION_PLAN_DETAILS[planType]
  if (!plan) return null
  return billingCycle === 'YEARLY' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly
}

export function getSubscriptionPrice(
  planType: SubscriptionPlanType,
  billingCycle: BillingCycle
): number {
  const plan = SUBSCRIPTION_PLAN_DETAILS[planType]
  if (!plan) return 0
  return billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice
}

export function getYearlySavings(planType: SubscriptionPlanType): number {
  const plan = SUBSCRIPTION_PLAN_DETAILS[planType]
  if (!plan) return 0
  return plan.monthlyPrice * 12 - plan.yearlyPrice
}

// ============================================
// LEGACY PACKAGE EXPORTS
// ============================================

export const PACKAGES = {
  BASIC: 'BASIC',
  PROFESSIONAL: 'PROFESSIONAL',
  PARTNER: 'PRO',
} as const

export type PackageType = (typeof PACKAGES)[keyof typeof PACKAGES]

export const PACKAGE_PRICES: Record<string, number> = {
  BASIC: 79,
  PROFESSIONAL: 199,
  PREMIUM: 499,
  PARTNER: 349,
  // Wardrobe prices
  WARDROBE_SINGLE_WALL: 20,
  WARDROBE_MULTI_WALL: 40,
  WARDROBE_BULK: 10,
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
