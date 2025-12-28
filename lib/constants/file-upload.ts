// lib/constants/file-upload.ts
// File upload configuration constants

/**
 * Maximum file size in bytes (4.5MB - Vercel serverless limit)
 * Update this when upgrading Vercel plan
 */
export const MAX_FILE_SIZE_BYTES = 4.5 * 1024 * 1024

/**
 * Maximum file size in MB for display
 */
export const MAX_FILE_SIZE_MB = 4.5

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const

/**
 * Allowed document MIME types
 */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const

/**
 * All allowed file MIME types
 */
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
] as const

/**
 * File extensions for images
 */
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

/**
 * File extensions for documents
 */
export const DOCUMENT_EXTENSIONS = ['.pdf', '.docx', '.xlsx']

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Get file size error message
 */
export function getFileSizeError(fileName: string, fileSize: number): string {
  return `File "${fileName}" is too large (${formatFileSize(fileSize)}). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(mimeType: string): boolean {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Check if file type is an image
 */
export function isImageType(mimeType: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType)
}
