'use client'

// components/stripe/EmbeddedCheckout.tsx
// Embedded Stripe Checkout component using Stripe Elements
// This provides a seamless in-page checkout experience

import { useState, useEffect, useCallback } from 'react'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe-client'
import { createOneTimeCheckout, createSubscriptionCheckout } from '@/lib/stripe-client'

interface EmbeddedCheckoutFormProps {
  type: 'one_time' | 'subscription'
  packageType?: 'BASIC' | 'PROFESSIONAL' | 'PREMIUM'
  planType?: 'STARTER' | 'PRO' | 'ENTERPRISE'
  billingCycle?: 'MONTHLY' | 'YEARLY'
  jobId?: string
}

export function EmbeddedCheckoutForm({
  type,
  packageType,
  planType,
  billingCycle = 'MONTHLY',
  jobId,
}: EmbeddedCheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch the client secret when component mounts
  const fetchClientSecret = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let response

      if (type === 'one_time' && packageType) {
        response = await createOneTimeCheckout(packageType, jobId)
      } else if (type === 'subscription' && planType) {
        response = await createSubscriptionCheckout(planType, billingCycle)
      } else {
        throw new Error('Invalid checkout configuration')
      }

      setClientSecret(response.clientSecret)
    } catch (err) {
      console.error('Error creating checkout session:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize checkout')
    } finally {
      setLoading(false)
    }
  }, [type, packageType, planType, billingCycle, jobId])

  useEffect(() => {
    fetchClientSecret()
  }, [fetchClientSecret])

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-muted">Preparing checkout...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-700 mb-2">Checkout Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchClientSecret}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // No client secret
  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-700">Unable to initialize checkout. Please try again.</p>
      </div>
    )
  }

  // Render embedded checkout
  return (
    <div id="checkout" className="min-h-[400px]">
      <EmbeddedCheckoutProvider
        stripe={getStripe()}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

// Loading skeleton for checkout
export function CheckoutSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-gray-200 rounded-lg" />
      <div className="h-12 bg-gray-200 rounded-lg" />
      <div className="h-12 bg-gray-200 rounded-lg" />
      <div className="h-12 bg-gray-200 rounded-lg w-1/2" />
      <div className="h-14 bg-gray-300 rounded-lg mt-6" />
    </div>
  )
}
