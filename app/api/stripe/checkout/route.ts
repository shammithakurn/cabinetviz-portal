// app/api/stripe/checkout/route.ts
// API route for creating Stripe Checkout sessions
// Supports both one-time payments and subscriptions

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  createOneTimeCheckoutSession,
  createSubscriptionCheckoutSession,
} from '@/lib/stripe'
import {
  ONE_TIME_PACKAGES,
  ONE_TIME_PACKAGE_DETAILS,
  SUBSCRIPTION_PLANS,
  BILLING_CYCLES,
  type OneTimePackageType,
  type SubscriptionPlanType,
  type BillingCycle,
} from '@/lib/constants/pricing'

// ============================================
// REQUEST VALIDATION
// ============================================

interface OneTimeCheckoutRequest {
  mode: 'one_time'
  packageType: OneTimePackageType
  jobId?: string
}

interface SubscriptionCheckoutRequest {
  mode: 'subscription'
  planType: SubscriptionPlanType
  billingCycle: BillingCycle
}

type CheckoutRequest = OneTimeCheckoutRequest | SubscriptionCheckoutRequest

function isValidOneTimePackage(value: string): value is OneTimePackageType {
  // Check if it's a valid key (BASIC, PROFESSIONAL, PREMIUM)
  return Object.keys(ONE_TIME_PACKAGES).includes(value) ||
    Object.keys(ONE_TIME_PACKAGE_DETAILS).includes(value)
}

function isValidSubscriptionPlan(value: string): value is SubscriptionPlanType {
  return Object.values(SUBSCRIPTION_PLANS).includes(value as SubscriptionPlanType)
}

function isValidBillingCycle(value: string): value is BillingCycle {
  return Object.values(BILLING_CYCLES).includes(value as BillingCycle)
}

// ============================================
// POST: Create Checkout Session
// ============================================

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to make a purchase' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json() as CheckoutRequest

    if (!body.mode || !['one_time', 'subscription'].includes(body.mode)) {
      return NextResponse.json(
        { error: 'Invalid checkout mode. Must be "one_time" or "subscription"' },
        { status: 400 }
      )
    }

    // 3. Handle one-time payment checkout
    if (body.mode === 'one_time') {
      const { packageType, jobId } = body as OneTimeCheckoutRequest

      if (!packageType || !isValidOneTimePackage(packageType)) {
        return NextResponse.json(
          { error: 'Invalid package type. Must be BASIC, PROFESSIONAL, or PREMIUM' },
          { status: 400 }
        )
      }

      // Create checkout session for one-time payment
      const { sessionId, clientSecret } = await createOneTimeCheckoutSession(
        user.id,
        user.email,
        user.name || undefined,
        packageType,
        jobId
      )

      return NextResponse.json({
        sessionId,
        clientSecret,
        mode: 'one_time',
        packageType,
      })
    }

    // 4. Handle subscription checkout
    if (body.mode === 'subscription') {
      const { planType, billingCycle } = body as SubscriptionCheckoutRequest

      if (!planType || !isValidSubscriptionPlan(planType)) {
        return NextResponse.json(
          { error: 'Invalid plan type. Must be STARTER, PRO, or ENTERPRISE' },
          { status: 400 }
        )
      }

      if (!billingCycle || !isValidBillingCycle(billingCycle)) {
        return NextResponse.json(
          { error: 'Invalid billing cycle. Must be MONTHLY or YEARLY' },
          { status: 400 }
        )
      }

      // Create checkout session for subscription
      const { sessionId, clientSecret } = await createSubscriptionCheckoutSession(
        user.id,
        user.email,
        user.name || undefined,
        planType,
        billingCycle
      )

      return NextResponse.json({
        sessionId,
        clientSecret,
        mode: 'subscription',
        planType,
        billingCycle,
      })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Checkout session creation error:', error)

    // Check for specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No Stripe price ID configured')) {
        return NextResponse.json(
          { error: 'This product is not yet available for purchase. Please contact support.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
