// lib/auth.config.ts
// NextAuth.js v5 configuration - Edge-compatible (no Prisma/bcrypt imports)
// This file is used by middleware, so it must be edge-compatible

import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

// Base config for middleware (edge-compatible)
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    newUser: '/dashboard',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name
        token.role = session.role
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard')
      const isOnAdmin = request.nextUrl.pathname.startsWith('/admin')
      const isOnJobs = request.nextUrl.pathname.startsWith('/jobs')
      const isOnAuth = request.nextUrl.pathname.startsWith('/auth')

      // Protect dashboard and jobs routes
      if (isOnDashboard || isOnJobs) {
        if (isLoggedIn) return true
        return false // Redirect to login
      }

      // Protect admin routes
      if (isOnAdmin) {
        if (!isLoggedIn) return false
        const role = auth?.user?.role
        if (role !== 'ADMIN' && role !== 'DESIGNER') {
          return Response.redirect(new URL('/dashboard', request.nextUrl))
        }
        return true
      }

      // Redirect logged in users away from auth pages
      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', request.nextUrl))
      }

      return true
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  trustHost: true,
} satisfies NextAuthConfig
