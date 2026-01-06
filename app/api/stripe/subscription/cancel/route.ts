// app/api/stripe/subscription/cancel/route.ts
// API route for cancelling a subscription at period end

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { cancelSubscriptionAtPeriodEnd } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // 1. Authenticate the user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to cancel your subscription' },
        { status: 401 }
      )
    }

    // 2. Get the user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        stripeSubscriptionId: true,
        status: true,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Subscription is not managed by Stripe' },
        { status: 400 }
      )
    }

    if (subscription.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      )
    }

    // 3. Cancel the subscription at period end in Stripe
    await cancelSubscriptionAtPeriodEnd(subscription.stripeSubscriptionId)

    // 4. Update local database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Your subscription will be cancelled at the end of the current billing period',
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)

    return NextResponse.json(
      { error: 'Failed to cancel subscription. Please try again.' },
      { status: 500 }
    )
  }
}
