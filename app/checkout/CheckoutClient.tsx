'use client'

// app/checkout/CheckoutClient.tsx
// Client wrapper for the embedded checkout component

import { EmbeddedCheckoutForm } from '@/components/stripe/EmbeddedCheckout'

interface CheckoutClientProps {
  type: 'one_time' | 'subscription'
  packageType?: 'BASIC' | 'PROFESSIONAL' | 'PREMIUM'
  planType?: 'STARTER' | 'PRO' | 'ENTERPRISE'
  billingCycle: 'MONTHLY' | 'YEARLY'
  jobId?: string
}

export function CheckoutClient({
  type,
  packageType,
  planType,
  billingCycle,
  jobId,
}: CheckoutClientProps) {
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
