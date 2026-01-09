// app/api/auth/signout/route.ts
// API route for server-side sign out

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = cookies()

  // Clear all auth-related cookies
  const authCookies = [
    'auth-token',
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'authjs.callback-url',
    'authjs.csrf-token',
    '__Host-authjs.csrf-token',
    '__Secure-authjs.callback-url',
  ]

  for (const cookieName of authCookies) {
    cookieStore.delete(cookieName)
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  // Also support GET for simple redirects
  const response = await POST()
  return response
}
