// middleware.ts
// NextAuth.js v5 middleware for route protection

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

// Use the auth middleware - redirect logic is in auth.config.ts authorized callback
export default auth

export const config = {
  matcher: [
    // Only match routes that need auth protection
    '/dashboard/:path*',
    '/jobs/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/checkout/:path*',
  ],
}
