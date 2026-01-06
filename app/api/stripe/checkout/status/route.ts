// app/api/stripe/checkout/status/route.ts
// API route for getting checkout session status (for success page)

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCheckoutSessionStatus } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Get session ID from query params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    // Validate session ID format (Stripe session IDs start with 'cs_')
    if (!sessionId.startsWith('cs_')) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Get session status from Stripe
    const status = await getCheckoutSessionStatus(sessionId)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error getting checkout session status:', error)

    return NextResponse.json(
      { error: 'Failed to retrieve checkout session status' },
      { status: 500 }
    )
  }
}
