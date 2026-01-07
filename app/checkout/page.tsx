// app/checkout/page.tsx
// Checkout page with Stripe embedded checkout
// Handles both one-time purchases and subscriptions

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import {
  ONE_TIME_PACKAGE_DETAILS,
  SUBSCRIPTION_PLAN_DETAILS,
  formatPrice,
  type OneTimePackageType,
  type SubscriptionPlanType,
  type BillingCycle,
} from '@/lib/constants/pricing'
import { CheckoutClient } from './CheckoutClient'

interface CheckoutPageProps {
  searchParams: {
    type?: string
    package?: string
    plan?: string
    billing?: string
    job?: string
  }
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  // Require authentication
  const user = await getCurrentUser()
  if (!user) {
    const redirectUrl = new URLSearchParams(searchParams).toString()
    redirect(`/auth/login?redirect=/checkout?${redirectUrl}`)
  }

  const { type, package: packageType, plan: planType, billing, job: jobId } = searchParams

  // Validate checkout type
  if (!type || !['one_time', 'subscription'].includes(type)) {
    redirect('/pricing')
  }

  // Validate one-time package
  if (type === 'one_time') {
    if (!packageType || !['BASIC', 'PROFESSIONAL', 'PREMIUM'].includes(packageType)) {
      redirect('/pricing')
    }
  }

  // Validate subscription plan
  if (type === 'subscription') {
    if (!planType || !['STARTER', 'PRO', 'ENTERPRISE'].includes(planType)) {
      redirect('/pricing')
    }
  }

  // Get product details for display
  const billingCycle = (billing === 'YEARLY' ? 'YEARLY' : 'MONTHLY') as BillingCycle

  let productName = ''
  let productDescription = ''
  let productPrice = 0
  let priceLabel = ''

  if (type === 'one_time' && packageType) {
    const pkg = ONE_TIME_PACKAGE_DETAILS[packageType as OneTimePackageType]
    productName = `${pkg.name} Package`
    productDescription = pkg.description
    productPrice = pkg.price
    priceLabel = pkg.priceLabel
  } else if (type === 'subscription' && planType) {
    const plan = SUBSCRIPTION_PLAN_DETAILS[planType as SubscriptionPlanType]
    productName = `${plan.name} Plan`
    productDescription = plan.description
    productPrice = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice
    priceLabel = billingCycle === 'YEARLY'
      ? `${formatPrice(plan.yearlyPrice)}/year`
      : `${formatPrice(plan.monthlyPrice)}/month`
  }

  return (
    <div className="min-h-screen bg-soft-cream">
      {/* Navigation */}
      <nav className="px-[4%] py-5 flex justify-between items-center bg-warm-white border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-warm-white font-bold text-sm">CV</span>
          </div>
          <span className="font-display text-xl font-semibold text-brand-600">CabinetViz</span>
        </Link>
        <Link
          href="/pricing"
          className="text-sm text-muted hover:text-brand-600 transition-colors"
        >
          &larr; Back to Pricing
        </Link>
      </nav>

      {/* Checkout Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-warm-white rounded-2xl p-6 border border-border sticky top-6">
              <h2 className="font-display text-lg font-bold text-brand-700 mb-4">
                Order Summary
              </h2>

              <div className="border-b border-border pb-4 mb-4">
                <h3 className="font-semibold text-brand-700">{productName}</h3>
                <p className="text-sm text-muted">{productDescription}</p>
                {type === 'subscription' && (
                  <p className="text-xs text-brand-600 mt-1">
                    Billed {billingCycle.toLowerCase()}
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mb-2">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(productPrice)}</span>
              </div>

              {type === 'subscription' && billingCycle === 'YEARLY' && planType && (
                <div className="flex justify-between items-center text-green-600 text-sm mb-2">
                  <span>Annual savings</span>
                  <span>
                    -{formatPrice(
                      SUBSCRIPTION_PLAN_DETAILS[planType as SubscriptionPlanType].monthlyPrice * 12 -
                      SUBSCRIPTION_PLAN_DETAILS[planType as SubscriptionPlanType].yearlyPrice
                    )}
                  </span>
                </div>
              )}

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-brand-700">Total</span>
                  <span className="text-2xl font-bold text-brand-600">{priceLabel}</span>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure checkout powered by Stripe
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  100% satisfaction guarantee
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="bg-warm-white rounded-2xl p-6 border border-border">
              <h1 className="font-display text-2xl font-bold text-brand-700 mb-6">
                Complete Your Purchase
              </h1>

              <CheckoutClient
                type={type as 'one_time' | 'subscription'}
                packageType={packageType as 'BASIC' | 'PROFESSIONAL' | 'PREMIUM' | undefined}
                planType={planType as 'STARTER' | 'PRO' | 'ENTERPRISE' | undefined}
                billingCycle={billingCycle}
                jobId={jobId}
                productName={productName}
                productPrice={productPrice}
              />
            </div>

            {/* Help text */}
            <p className="text-center text-sm text-muted mt-4">
              Having trouble?{' '}
              <Link href="/contact" className="text-brand-600 hover:underline">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
