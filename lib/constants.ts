// lib/constants.ts
// Centralized constants for easy configuration

/**
 * Maximum file upload size in bytes
 * Vercel Serverless Function Limits:
 * - Hobby: 4.5MB
 * - Pro: 4.5MB (can be increased with Edge Functions)
 * - Enterprise: Configurable
 *
 * Update this value when upgrading Vercel plan
 */
export const MAX_FILE_SIZE_BYTES = 4.5 * 1024 * 1024 // 4.5MB

/**
 * Maximum file upload size in MB (for display purposes)
 */
export const MAX_FILE_SIZE_MB = 4.5

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Get error message for file size limit exceeded
 */
export function getFileSizeError(fileName: string, fileSize: number): string {
  return `File "${fileName}" is too large (${formatFileSize(fileSize)}). Maximum allowed size is ${MAX_FILE_SIZE_MB}MB.`
}
