// app/api/stripe/checkout/route.ts
// API route for creating Stripe Checkout sessions
// Supports both one-time payments and subscriptions

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'
import {
  ALL_PACKAGE_DETAILS,
  SUBSCRIPTION_PLANS,
  BILLING_CYCLES,
  type AllPackageType,
  type SubscriptionPlanType,
  type BillingCycle,
  getSubscriptionPriceId,
} from '@/lib/constants/pricing'

// ============================================
// REQUEST VALIDATION
// ============================================

interface OneTimeCheckoutRequest {
  mode: 'one_time'
  packageId: string // Package ID like KITCHEN_BASIC, WARDROBE_SINGLE_WALL
  jobId?: string
}

interface SubscriptionCheckoutRequest {
  mode: 'subscription'
  planType: SubscriptionPlanType
  billingCycle: BillingCycle
}

type CheckoutRequest = OneTimeCheckoutRequest | SubscriptionCheckoutRequest

function isValidPackageId(value: string): value is AllPackageType {
  return Object.keys(ALL_PACKAGE_DETAILS).includes(value)
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // 3. Handle one-time payment checkout
    if (body.mode === 'one_time') {
      const { packageId, jobId } = body as OneTimeCheckoutRequest

      if (!packageId || !isValidPackageId(packageId)) {
        return NextResponse.json(
          { error: 'Invalid package ID. Must be a valid Kitchen or Wardrobe package.' },
          { status: 400 }
        )
      }

      // Get package details
      const pkg = ALL_PACKAGE_DETAILS[packageId]

      // Debug: Log the package and price ID status
      console.log('Package lookup:', packageId, 'Found:', !!pkg, 'PriceId:', pkg?.stripePriceId || 'MISSING')

      if (!pkg.stripePriceId) {
        console.error(`Missing Stripe Price ID for package: ${packageId}. Check STRIPE_PRICE_* env vars.`)
        return NextResponse.json(
          { error: `This package is not yet available for purchase. Please contact support. (Missing price config for ${packageId})` },
          { status: 400 }
        )
      }

      // Create checkout session for one-time payment
      const { sessionId, clientSecret } = await createCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        userName: user.name || undefined,
        priceId: pkg.stripePriceId,
        mode: 'payment',
        successUrl: `${baseUrl}/checkout/success`,
        cancelUrl: `${baseUrl}/pricing`,
        metadata: {
          type: 'one_time',
          packageId,
          category: pkg.category,
        },
        jobId,
      })

      return NextResponse.json({
        sessionId,
        clientSecret,
        mode: 'one_time',
        packageId,
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

      // Get subscription price ID
      const priceId = getSubscriptionPriceId(planType, billingCycle)
      if (!priceId) {
        return NextResponse.json(
          { error: 'This subscription plan is not yet available. Please contact support.' },
          { status: 400 }
        )
      }

      // Create checkout session for subscription
      const { sessionId, clientSecret } = await createCheckoutSession({
        userId: user.id,
        userEmail: user.email,
        userName: user.name || undefined,
        priceId,
        mode: 'subscription',
        successUrl: `${baseUrl}/checkout/success`,
        cancelUrl: `${baseUrl}/pricing`,
        metadata: {
          type: 'subscription',
          planType,
          billingCycle,
        },
      })

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
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Check for specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No Stripe price ID configured')) {
        return NextResponse.json(
          { error: 'This product is not yet available for purchase. Please contact support.' },
          { status: 400 }
        )
      }

      // Check for Stripe API errors
      if (error.message.includes('Stripe')) {
        return NextResponse.json(
          { error: `Stripe error: ${error.message}` },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
