// app/api/myob/auth/status/route.ts
// API route for checking MYOB authentication status

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isMYOBConfigured, getAuthorizationUrl } from '@/lib/myob'

export async function GET() {
  try {
    // Check user authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const isConfigured = isMYOBConfigured()

    // For now, assume authenticated if configured
    // In production, you'd check if tokens are stored in database
    const isAuthenticated = isConfigured

    let authUrl: string | undefined
    if (isConfigured && !isAuthenticated) {
      try {
        authUrl = getAuthorizationUrl(`user_${user.id}`)
      } catch {
        // Auth URL generation failed, likely missing config
      }
    }

    return NextResponse.json({
      isConfigured,
      isAuthenticated,
      authUrl,
    })
  } catch (error) {
    console.error('Error checking MYOB auth status:', error)
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    )
  }
}
