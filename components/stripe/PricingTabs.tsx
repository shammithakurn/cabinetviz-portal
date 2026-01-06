'use client'

// components/stripe/PricingTabs.tsx
// Client component for pricing page with tab switching and checkout initiation

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type OneTimePackage,
  type SubscriptionPlan,
  formatPrice,
} from '@/lib/constants/pricing'

interface PricingTabsProps {
  oneTimePackages: OneTimePackage[]
  subscriptionPlans: (SubscriptionPlan & { yearlySavings: number })[]
  isLoggedIn: boolean
}

export function PricingTabs({
  oneTimePackages,
  subscriptionPlans,
  isLoggedIn,
}: PricingTabsProps) {
  const [activeTab, setActiveTab] = useState<'one-time' | 'subscription'>('one-time')
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const router = useRouter()

  const handleSelectPackage = (packageId: string) => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/checkout?type=one_time&package=${packageId}`)
      return
    }
    router.push(`/checkout?type=one_time&package=${packageId}`)
  }

  const handleSelectPlan = (planId: string) => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/checkout?type=subscription&plan=${planId}&billing=${billingCycle}`)
      return
    }
    router.push(`/checkout?type=subscription&plan=${planId}&billing=${billingCycle}`)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-soft-cream rounded-xl p-1.5">
          <button
            onClick={() => setActiveTab('one-time')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'one-time'
                ? 'bg-warm-white text-brand-700 shadow-sm'
                : 'text-muted hover:text-brand-600'
            }`}
          >
            One-Time Packages
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'subscription'
                ? 'bg-warm-white text-brand-700 shadow-sm'
                : 'text-muted hover:text-brand-600'
            }`}
          >
            Subscription Plans
          </button>
        </div>
      </div>

      {/* Billing Cycle Toggle (for subscriptions) */}
      {activeTab === 'subscription' && (
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-3 bg-soft-cream rounded-full px-4 py-2">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'MONTHLY'
                  ? 'bg-brand-600 text-warm-white'
                  : 'text-muted hover:text-brand-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'YEARLY'
                  ? 'bg-brand-600 text-warm-white'
                  : 'text-muted hover:text-brand-600'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs opacity-80">Save ~17%</span>
            </button>
          </div>
        </div>
      )}

      {/* One-Time Packages */}
      {activeTab === 'one-time' && (
        <div className="grid md:grid-cols-3 gap-6">
          {oneTimePackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative bg-warm-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                pkg.popular
                  ? 'border-brand-600 shadow-md'
                  : 'border-border hover:border-brand-400'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-warm-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-display font-bold text-brand-700 mb-1">
                  {pkg.name}
                </h3>
                <p className="text-sm text-muted mb-4">{pkg.description}</p>
                <div className="text-4xl font-bold text-brand-600">
                  {pkg.priceLabel}
                </div>
                <p className="text-sm text-muted mt-1">per project</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent-gold">★</span>
                  <span>{pkg.renders} 3D renders</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent-gold">★</span>
                  <span>{pkg.revisions} revision{pkg.revisions > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent-gold">★</span>
                  <span>{pkg.deliveryDays}-day delivery</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {pkg.features.slice(3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPackage(pkg.id)}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  pkg.popular
                    ? 'bg-brand-600 text-warm-white hover:bg-brand-700'
                    : 'bg-soft-cream text-brand-600 hover:bg-brand-100'
                }`}
              >
                {isLoggedIn ? 'Select Package' : 'Sign In to Purchase'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Subscription Plans */}
      {activeTab === 'subscription' && (
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-warm-white rounded-2xl p-6 border-2 transition-all hover:shadow-lg ${
                plan.popular
                  ? 'border-brand-600 shadow-md'
                  : 'border-border hover:border-brand-400'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-600 text-warm-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-display font-bold text-brand-700 mb-1">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-brand-600">
                  {formatPrice(billingCycle === 'YEARLY' ? plan.yearlyMonthlyEquivalent : plan.monthlyPrice)}
                </div>
                <p className="text-sm text-muted mt-1">
                  per month{billingCycle === 'YEARLY' && ', billed yearly'}
                </p>
                {billingCycle === 'YEARLY' && plan.yearlySavings > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    Save {formatPrice(plan.yearlySavings)} per year
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent-gold">★</span>
                  <span>{plan.projectsPerMonth} projects/month</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent-gold">★</span>
                  <span>
                    {plan.rendersPerProject === 'unlimited'
                      ? 'Unlimited'
                      : plan.rendersPerProject}{' '}
                    renders/project
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-accent-gold">★</span>
                  <span>
                    {plan.revisionsPerProject === 'unlimited'
                      ? 'Unlimited'
                      : plan.revisionsPerProject}{' '}
                    revisions/project
                  </span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.slice(3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  plan.popular
                    ? 'bg-brand-600 text-warm-white hover:bg-brand-700'
                    : 'bg-soft-cream text-brand-600 hover:bg-brand-100'
                }`}
              >
                {isLoggedIn ? 'Subscribe Now' : 'Sign In to Subscribe'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Money-back guarantee */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          100% Satisfaction Guarantee • Cancel Anytime
        </div>
      </div>
    </div>
  )
}
