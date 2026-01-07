// app/api/myob/auth/callback/route.ts
// OAuth callback handler for MYOB authentication

import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken } from '@/lib/myob'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle errors from MYOB
    if (error) {
      console.error('MYOB OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        new URL(`/dashboard/billing?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      )
    }

    // Validate code is present
    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/billing?error=No%20authorization%20code%20received', request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code)

    // In production, store tokens securely in database
    // For now, they're cached in memory (lib/myob.ts)
    console.log('MYOB authentication successful')
    console.log('State:', state) // Contains user_id for matching

    // Store tokens in database for the user
    // TODO: Implement proper token storage
    // await prisma.myobTokens.upsert({
    //   where: { userId: extractUserId(state) },
    //   create: { ... },
    //   update: { ... },
    // })

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/dashboard/billing?myob_connected=true', request.url)
    )
  } catch (error) {
    console.error('Error handling MYOB callback:', error)
    return NextResponse.redirect(
      new URL(`/dashboard/billing?error=${encodeURIComponent('Failed to connect MYOB')}`, request.url)
    )
  }
}
