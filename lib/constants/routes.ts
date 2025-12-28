// lib/constants/routes.ts
// Application route constants

/**
 * Public routes (no auth required)
 */
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  PRIVACY: '/privacy',
  TERMS: '/terms',
} as const

/**
 * Customer dashboard routes
 */
export const DASHBOARD_ROUTES = {
  HOME: '/dashboard',
  JOBS: '/dashboard/jobs',
  BILLING: '/dashboard/billing',
  DOWNLOADS: '/dashboard/downloads',
  MESSAGES: '/dashboard/messages',
  HELP: '/dashboard/help',
  SETTINGS: '/dashboard/settings',
} as const

/**
 * Job routes
 */
export const JOB_ROUTES = {
  NEW: '/jobs/new',
  DETAIL: (id: string) => `/jobs/${id}`,
} as const

/**
 * Admin routes
 */
export const ADMIN_ROUTES = {
  HOME: '/admin',
  JOBS: '/admin/jobs',
  JOB_DETAIL: (id: string) => `/admin/jobs/${id}`,
  JOB_DELIVERABLES: (id: string) => `/admin/jobs/${id}/deliverables`,
  CUSTOMERS: '/admin/customers',
  CUSTOMER_DETAIL: (id: string) => `/admin/customers/${id}`,
  PAYMENTS: '/admin/payments',
  SUBSCRIPTIONS: '/admin/subscriptions',
  DISCOUNTS: '/admin/discounts',
  FESTIVALS: '/admin/festivals',
  THEME: '/admin/theme',
  REPORTS: '/admin/reports',
  SETTINGS: '/admin/settings',
} as const

/**
 * API routes
 */
export const API_ROUTES = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',

  // Jobs
  JOBS: '/api/jobs',

  // Upload
  UPLOAD: '/api/upload',

  // Admin
  ADMIN_PAYMENTS: '/api/admin/payments',
  ADMIN_PAYMENT: (id: string) => `/api/admin/payments/${id}`,
  ADMIN_SUBSCRIPTIONS: '/api/admin/subscriptions',
  ADMIN_SUBSCRIPTION: (id: string) => `/api/admin/subscriptions/${id}`,
  ADMIN_DISCOUNTS: '/api/admin/discounts',
  ADMIN_DISCOUNT: (id: string) => `/api/admin/discounts/${id}`,
  ADMIN_THEME: '/api/admin/theme',
  ADMIN_IMAGES: '/api/admin/images',
  ADMIN_DELIVERABLES: '/api/admin/deliverables',
  ADMIN_FESTIVALS: '/api/admin/festivals',
  ADMIN_CUSTOM_FESTIVALS: '/api/admin/custom-festivals',
  ADMIN_ANIMATION_ELEMENTS: '/api/admin/animation-elements',

  // Festivals
  FESTIVALS: '/api/festivals',
  FESTIVAL_GREETING: '/api/festivals/greeting',
} as const

/**
 * Check if route is public
 */
export function isPublicRoute(path: string): boolean {
  return Object.values(PUBLIC_ROUTES).includes(path as typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES])
}

/**
 * Check if route is admin route
 */
export function isAdminRoute(path: string): boolean {
  return path.startsWith('/admin')
}

/**
 * Get redirect URL after login based on user role
 */
export function getPostLoginRedirect(role: string): string {
  return role === 'ADMIN' || role === 'DESIGNER'
    ? ADMIN_ROUTES.HOME
    : DASHBOARD_ROUTES.HOME
}
