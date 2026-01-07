'use client'

// app/checkout/CheckoutClient.tsx
// Client wrapper for checkout - supports both Stripe and MYOB payment providers

import { useState, useEffect } from 'react'
import { EmbeddedCheckoutForm } from '@/components/stripe/EmbeddedCheckout'
import { MYOBCheckout } from '@/components/myob'

interface CheckoutClientProps {
  type: 'one_time' | 'subscription'
  packageType?: 'BASIC' | 'PROFESSIONAL' | 'PREMIUM'
  planType?: 'STARTER' | 'PRO' | 'ENTERPRISE'
  billingCycle: 'MONTHLY' | 'YEARLY'
  jobId?: string
  productName: string
  productPrice: number
  paymentProvider?: 'stripe' | 'myob'
}

export function CheckoutClient({
  type,
  packageType,
  planType,
  billingCycle,
  jobId,
  productName,
  productPrice,
  paymentProvider = 'stripe', // Default to Stripe
}: CheckoutClientProps) {
  const [provider, setProvider] = useState<'stripe' | 'myob' | 'loading'>('loading')

  useEffect(() => {
    // Check which payment provider is configured
    async function checkProvider() {
      // First check if Stripe is configured (preferred)
      if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        setProvider('stripe')
        return
      }

      // Fall back to MYOB if Stripe is not configured
      try {
        const myobResponse = await fetch('/api/myob/auth/status')
        const myobData = await myobResponse.json()

        if (myobData.isConfigured) {
          setProvider('myob')
          return
        }
      } catch {
        // MYOB not available
      }

      // Default to provided payment provider
      setProvider(paymentProvider)
    }

    checkProvider()
  }, [paymentProvider])

  if (provider === 'loading') {
    return (
      <div className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-sm text-muted">Loading checkout...</p>
      </div>
    )
  }

  if (provider === 'myob') {
    return (
      <MYOBCheckout
        type={type}
        packageType={packageType}
        planType={planType}
        billingCycle={billingCycle}
        jobId={jobId}
        productName={productName}
        productPrice={productPrice}
      />
    )
  }

  // Stripe checkout
  return (
    <EmbeddedCheckoutForm
      type={type}
      packageType={packageType}
      planType={planType}
      billingCycle={billingCycle}
      jobId={jobId}
    />
  )
}
