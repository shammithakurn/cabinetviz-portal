// lib/auth.ts
// Authentication utilities - JWT tokens, password hashing, session management

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

export interface UserPayload {
  id: string
  email: string
  name: string
  role: string
}

// ============================================
// PASSWORD UTILITIES
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// ============================================
// JWT UTILITIES
// ============================================

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserPayload
  } catch {
    return null
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) return null

  return verifyToken(token)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      phone: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// ============================================
// AUTH ACTIONS
// ============================================

export async function setAuthCookie(token: string) {
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function removeAuthCookie() {
  cookies().delete('auth-token')
}
