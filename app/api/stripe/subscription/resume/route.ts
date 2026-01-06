// app/api/stripe/subscription/resume/route.ts
// API route for resuming a cancelled subscription (before period ends)

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { resumeSubscription } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // 1. Authenticate the user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to resume your subscription' },
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
        cancelAtPeriodEnd: true,
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
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
        { error: 'Cannot resume a fully cancelled subscription. Please subscribe again.' },
        { status: 400 }
      )
    }

    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json(
        { error: 'Subscription is not set to cancel' },
        { status: 400 }
      )
    }

    // 3. Resume the subscription in Stripe
    await resumeSubscription(subscription.stripeSubscriptionId)

    // 4. Update local database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        cancelledAt: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Your subscription has been resumed',
    })
  } catch (error) {
    console.error('Error resuming subscription:', error)

    return NextResponse.json(
      { error: 'Failed to resume subscription. Please try again.' },
      { status: 500 }
    )
  }
}
