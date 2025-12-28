// lib/constants.ts
// Re-exports from organized constants for backward compatibility
// New code should import from '@/lib/constants/file-upload' etc.

// File upload constants
export {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  formatFileSize,
  getFileSizeError,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_FILE_TYPES,
  isAllowedFileType,
  isImageType,
} from './constants/file-upload'

// Pricing constants
export {
  PACKAGES,
  PACKAGE_PRICES,
  PACKAGE_FEATURES,
  BILLING_CYCLES,
  PARTNER_LIMITS,
  CURRENCY,
  formatPrice,
} from './constants/pricing'

// Job status constants
export {
  JOB_STATUS,
  JOB_STATUS_LABELS,
  JOB_STATUS_COLORS,
  JOB_STATUS_TRANSITIONS,
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPE_ICONS,
  FILE_CATEGORIES,
  DELIVERABLE_TYPES,
  isValidStatusTransition,
  getStatusLabel,
  getStatusColor,
  getProjectTypeLabel,
  getProjectTypeIcon,
} from './constants/job-status'

// Route constants
export {
  PUBLIC_ROUTES,
  DASHBOARD_ROUTES,
  JOB_ROUTES,
  ADMIN_ROUTES,
  API_ROUTES,
  isPublicRoute,
  isAdminRoute,
  getPostLoginRedirect,
} from './constants/routes'
