// lib/constants/job-status.ts
// Job status constants and helpers

/**
 * Job statuses
 */
export const JOB_STATUS = {
  PENDING: 'PENDING',
  QUOTED: 'QUOTED',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  REVISION: 'REVISION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS]

/**
 * Status display labels
 */
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  PENDING: 'Pending Review',
  QUOTED: 'Quote Sent',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Ready for Review',
  REVISION: 'Revision Requested',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

/**
 * Status colors for UI
 */
export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  QUOTED: 'bg-purple-100 text-purple-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-indigo-100 text-indigo-700',
  REVISION: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
}

/**
 * Valid status transitions
 */
export const JOB_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  PENDING: ['QUOTED', 'CANCELLED'],
  QUOTED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['REVIEW', 'CANCELLED'],
  REVIEW: ['REVISION', 'COMPLETED'],
  REVISION: ['IN_PROGRESS'],
  COMPLETED: [],
  CANCELLED: [],
}

/**
 * Project types
 */
export const PROJECT_TYPES = {
  KITCHEN: 'KITCHEN',
  WARDROBE: 'WARDROBE',
  BATHROOM_VANITY: 'BATHROOM_VANITY',
  ENTERTAINMENT_UNIT: 'ENTERTAINMENT_UNIT',
  HOME_OFFICE: 'HOME_OFFICE',
  LAUNDRY: 'LAUNDRY',
  CUSTOM: 'CUSTOM',
} as const

export type ProjectType = (typeof PROJECT_TYPES)[keyof typeof PROJECT_TYPES]

/**
 * Project type labels
 */
export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  KITCHEN: 'Kitchen',
  WARDROBE: 'Wardrobe',
  BATHROOM_VANITY: 'Bathroom Vanity',
  ENTERTAINMENT_UNIT: 'Entertainment Unit',
  HOME_OFFICE: 'Home Office',
  LAUNDRY: 'Laundry',
  CUSTOM: 'Custom',
}

/**
 * Project type icons (emoji)
 */
export const PROJECT_TYPE_ICONS: Record<ProjectType, string> = {
  KITCHEN: '🍳',
  WARDROBE: '👔',
  BATHROOM_VANITY: '🚿',
  ENTERTAINMENT_UNIT: '📺',
  HOME_OFFICE: '💼',
  LAUNDRY: '🧺',
  CUSTOM: '🔧',
}

/**
 * File categories for job uploads
 */
export const FILE_CATEGORIES = {
  MEASUREMENT: 'MEASUREMENT',
  SKETCH: 'SKETCH',
  REFERENCE: 'REFERENCE',
  PHOTO: 'PHOTO',
  FLOOR_PLAN: 'FLOOR_PLAN',
  RENDER_3D: 'RENDER_3D',
  DRAWING_2D: 'DRAWING_2D',
  CUT_LIST: 'CUT_LIST',
  OTHER: 'OTHER',
} as const

export type FileCategory = (typeof FILE_CATEGORIES)[keyof typeof FILE_CATEGORIES]

/**
 * Deliverable types
 */
export const DELIVERABLE_TYPES = {
  RENDER_FRONT: 'RENDER_FRONT',
  RENDER_PERSPECTIVE: 'RENDER_PERSPECTIVE',
  RENDER_TOP: 'RENDER_TOP',
  RENDER_DETAIL: 'RENDER_DETAIL',
  DRAWING_ELEVATION: 'DRAWING_ELEVATION',
  DRAWING_PLAN: 'DRAWING_PLAN',
  DRAWING_SECTION: 'DRAWING_SECTION',
  CUT_LIST: 'CUT_LIST',
  ASSEMBLY_GUIDE: 'ASSEMBLY_GUIDE',
  MATERIAL_LIST: 'MATERIAL_LIST',
} as const

export type DeliverableType = (typeof DELIVERABLE_TYPES)[keyof typeof DELIVERABLE_TYPES]

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(from: JobStatus, to: JobStatus): boolean {
  return JOB_STATUS_TRANSITIONS[from]?.includes(to) ?? false
}

/**
 * Get status label
 */
export function getStatusLabel(status: string): string {
  return JOB_STATUS_LABELS[status as JobStatus] ?? status
}

/**
 * Get status color classes
 */
export function getStatusColor(status: string): string {
  return JOB_STATUS_COLORS[status as JobStatus] ?? 'bg-gray-100 text-gray-700'
}

/**
 * Get project type label
 */
export function getProjectTypeLabel(type: string): string {
  return PROJECT_TYPE_LABELS[type as ProjectType] ?? type
}

/**
 * Get project type icon
 */
export function getProjectTypeIcon(type: string): string {
  return PROJECT_TYPE_ICONS[type as ProjectType] ?? '📦'
}
