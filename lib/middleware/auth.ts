// lib/middleware/auth.ts
// Centralized authentication middleware for API routes

import { getCurrentUser } from '@/lib/auth'
import { unauthorizedResponse, forbiddenResponse } from '@/lib/api-response'
import type { SafeUser } from '@/types/database'

type UserRole = 'CUSTOMER' | 'ADMIN' | 'DESIGNER'

// Result type for auth middleware functions
type AuthResult = { user: SafeUser; error?: never } | { user?: never; error: Response }

/**
 * Require authentication - returns user or unauthorized response
 */
export async function requireAuth(): Promise<AuthResult> {
  const user = await getCurrentUser()

  if (!user) {
    return { error: unauthorizedResponse() }
  }

  return { user }
}

/**
 * Require specific role(s) - returns user or forbidden response
 */
export async function requireRole(roles: UserRole | UserRole[]): Promise<AuthResult> {
  const result = await requireAuth()

  if ('error' in result) {
    return result
  }

  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  if (!allowedRoles.includes(result.user.role as UserRole)) {
    return { error: forbiddenResponse('Insufficient permissions') }
  }

  return result
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<AuthResult> {
  return requireRole('ADMIN')
}

/**
 * Require admin or designer role
 */
export async function requireAdminOrDesigner(): Promise<AuthResult> {
  return requireRole(['ADMIN', 'DESIGNER'])
}

/**
 * Require the user to own a resource or be admin
 */
export async function requireOwnerOrAdmin(ownerId: string): Promise<AuthResult> {
  const result = await requireAuth()

  if ('error' in result) {
    return result
  }

  if (result.user.id !== ownerId && result.user.role !== 'ADMIN') {
    return { error: forbiddenResponse('You do not have access to this resource') }
  }

  return result
}
