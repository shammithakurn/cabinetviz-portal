// middleware.ts
// NextAuth.js v5 middleware for route protection

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  // API routes should be handled by the API route handlers
  if (pathname.startsWith('/api/auth')) {
    return
  }

  // Protected routes
  const protectedRoutes = ['/dashboard', '/jobs', '/admin']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/auth/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  // Admin routes require ADMIN or DESIGNER role
  if (pathname.startsWith('/admin') && isLoggedIn) {
    const role = req.auth?.user?.role
    if (role !== 'ADMIN' && role !== 'DESIGNER') {
      return Response.redirect(new URL('/dashboard', req.nextUrl.origin))
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname.startsWith('/auth') && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl.origin))
  }
})

export const config = {
  matcher: [
    // Match all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|logo.*|uploads/|images/|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
}
