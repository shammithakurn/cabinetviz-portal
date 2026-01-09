// lib/stripe-client.ts
// Client-side Stripe utilities - Safe to import in client components
// This file only uses the publishable key (public)

import { loadStripe, type Stripe } from '@stripe/stripe-js'

// ============================================
// STRIPE PROMISE (for Elements and Checkout)
// ============================================

// Cache the Stripe promise to avoid multiple loads
let stripePromise: Promise<Stripe | null> | null = null

/**
 * Get the Stripe instance for client-side usage
 * Uses the publishable key from environment variables
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
      return Promise.resolve(null)
    }

    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}

// ============================================
// CHECKOUT API CALLS
// ============================================

interface CreateCheckoutResponse {
  sessionId: string
  clientSecret: string
}

interface CheckoutError {
  error: string
}

/**
 * Create a checkout session for a one-time package purchase
 * Supports new package IDs like KITCHEN_BASIC, WARDROBE_SINGLE_WALL
 */
export async function createOneTimeCheckout(
  packageId: string,
  jobId?: string
): Promise<CreateCheckoutResponse> {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'one_time',
      packageId,
      jobId,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error((data as CheckoutError).error || 'Failed to create checkout session')
  }

  return data as CreateCheckoutResponse
}

/**
 * Create a checkout session for a subscription
 */
export async function createSubscriptionCheckout(
  planType: 'STARTER' | 'PRO' | 'ENTERPRISE',
  billingCycle: 'MONTHLY' | 'YEARLY'
): Promise<CreateCheckoutResponse> {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mode: 'subscription',
      planType,
      billingCycle,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error((data as CheckoutError).error || 'Failed to create checkout session')
  }

  return data as CreateCheckoutResponse
}

/**
 * Get checkout session status (for success page)
 */
export async function getCheckoutStatus(sessionId: string): Promise<{
  status: 'complete' | 'open' | 'expired'
  customerEmail: string | null
  paymentStatus: string
  mode: 'payment' | 'subscription' | 'setup'
  metadata: Record<string, string>
}> {
  const response = await fetch(`/api/stripe/checkout/status?session_id=${sessionId}`)

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to get checkout status')
  }

  return data
}

/**
 * Create a customer portal session URL
 */
export async function createPortalSession(): Promise<{ url: string }> {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create portal session')
  }

  return data
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(): Promise<{ success: boolean }> {
  const response = await fetch('/api/stripe/subscription/cancel', {
    method: 'POST',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to cancel subscription')
  }

  return data
}

/**
 * Resume a cancelled subscription
 */
export async function resumeSubscription(): Promise<{ success: boolean }> {
  const response = await fetch('/api/stripe/subscription/resume', {
    method: 'POST',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to resume subscription')
  }

  return data
}
