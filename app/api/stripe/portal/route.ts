// app/api/stripe/portal/route.ts
// API route for creating Stripe Customer Portal sessions
// Allows customers to manage subscriptions, payment methods, and invoices

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createCustomerPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // 1. Authenticate the user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to access the customer portal' },
        { status: 401 }
      )
    }

    // 2. Get the user's Stripe customer ID from their subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    })

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe to access the customer portal.' },
        { status: 400 }
      )
    }

    // 3. Create the portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const returnUrl = `${baseUrl}/dashboard`

    const portalUrl = await createCustomerPortalSession(
      subscription.stripeCustomerId,
      returnUrl
    )

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('Error creating customer portal session:', error)

    return NextResponse.json(
      { error: 'Failed to create customer portal session. Please try again.' },
      { status: 500 }
    )
  }
}
