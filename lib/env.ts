// lib/env.ts
// Environment variable validation and configuration

/**
 * Required environment variables
 */
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const

/**
 * Optional environment variables with defaults
 */
const optionalEnvVars = {
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  NEXT_PUBLIC_APP_NAME: 'CabinetViz',
} as const

/**
 * Validate that all required environment variables are set
 * Call this at application startup
 */
export function validateEnv(): void {
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\nSee .env.example for required variables.`
    )
  }

  // Warn about weak JWT secret in production
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production'
  ) {
    console.warn(
      '⚠️  WARNING: Using default JWT_SECRET in production. This is insecure!'
    )
  }

  // Warn if BLOB_READ_WRITE_TOKEN is missing (needed for file uploads)
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn(
      '⚠️  WARNING: BLOB_READ_WRITE_TOKEN is not set. File uploads will not work.'
    )
  }
}

/**
 * Get environment configuration
 */
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Auth
  JWT_SECRET: process.env.JWT_SECRET!,

  // Blob storage
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,

  // App
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || optionalEnvVars.NEXT_PUBLIC_APP_URL,
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || optionalEnvVars.NEXT_PUBLIC_APP_NAME,

  // Runtime
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const

/**
 * Check if blob storage is configured
 */
export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}
