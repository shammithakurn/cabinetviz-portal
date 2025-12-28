// types/api.ts
// API request and response types

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string
  errors?: Record<string, string[]>
}

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  data: T
  message?: string
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  file: {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    url: string
    category: string
  }
}

/**
 * Auth login request
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * Auth register request
 */
export interface RegisterRequest {
  email: string
  password: string
  name: string
  company?: string
  phone?: string
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  token?: string
}

/**
 * Create job request
 */
export interface CreateJobRequest {
  title: string
  description: string
  projectType: string
  package: string
  dimensions?: {
    width?: number
    height?: number
    depth?: number
    unit?: string
  }
  style?: {
    finishType?: string
    color?: string
    handleStyle?: string
  }
  notes?: string
}

/**
 * Payment request
 */
export interface CreatePaymentRequest {
  userId: string
  jobId?: string
  type: 'SUBSCRIPTION' | 'PROJECT' | 'ONE_TIME'
  amount: number
  description?: string
  discountCode?: string
}

/**
 * Subscription request
 */
export interface CreateSubscriptionRequest {
  userId: string
  billingCycle: 'MONTHLY' | 'YEARLY'
}

/**
 * Discount request
 */
export interface CreateDiscountRequest {
  code: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  scope: 'ALL' | 'SUBSCRIPTION' | 'PROJECT' | 'USER_SPECIFIC'
  maxUses?: number
  startDate?: string
  endDate?: string
  targetUserIds?: string[]
}

/**
 * Theme setting update request
 */
export interface UpdateThemeRequest {
  settings: Array<{
    key: string
    value: string
  }>
}
