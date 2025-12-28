// lib/api-response.ts
// Centralized API response helpers for consistent responses across all routes

import { NextResponse } from 'next/server'

/**
 * Standard success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 })
}

/**
 * Standard error response
 */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Unauthorized error (401)
 */
export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Forbidden error (403)
 */
export function forbiddenResponse(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

/**
 * Not found error (404)
 */
export function notFoundResponse(resource = 'Resource') {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 })
}

/**
 * Validation error (422)
 */
export function validationErrorResponse(errors: Record<string, string[]> | string) {
  const message = typeof errors === 'string' ? errors : 'Validation failed'
  return NextResponse.json(
    { error: message, ...(typeof errors === 'object' && { errors }) },
    { status: 422 }
  )
}

/**
 * Internal server error (500)
 */
export function serverErrorResponse(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 })
}

/**
 * Handle common API errors and return appropriate response
 */
export function handleApiError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof Error) {
    // Check for known error types
    if (error.message.includes('BLOB_READ_WRITE_TOKEN') || error.message.includes('token')) {
      return errorResponse('Blob storage not configured properly', 500)
    }
    if (error.message.includes('Forbidden') || error.message.includes('403')) {
      return forbiddenResponse('Storage access denied')
    }
    return serverErrorResponse(error.message)
  }

  return serverErrorResponse('An unexpected error occurred')
}
