'use client'

// components/stripe/PricingTabs.tsx
// Client component for pricing page with Kitchen/Wardrobe tabs

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  type Package,
  type SubscriptionPlan,
  formatPrice,
} from '@/lib/constants/pricing'

interface PricingTabsProps {
  kitchenPackages: Package[]
  wardrobePackages: Package[]
  subscriptionPlans: (SubscriptionPlan & { yearlySavings: number })[]
  isLoggedIn: boolean
}

export function PricingTabs({
  kitchenPackages,
  wardrobePackages,
  subscriptionPlans,
  isLoggedIn,
}: PricingTabsProps) {
  const [activeTab, setActiveTab] = useState<'kitchen' | 'wardrobe' | 'subscription'>('kitchen')
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

  const renderPackageCard = (pkg: Package) => (
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
            Best Value
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
        <p className="text-sm text-muted mt-1">
          {pkg.perUnit ? 'per wardrobe (min 5)' : 'one-time'}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-700">
          {pkg.category === 'KITCHEN' ? (
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          )}
          <span>
            {pkg.perUnit ? `${pkg.units}+ ${pkg.unitLabel}s` : `${pkg.units} ${pkg.unitLabel}${pkg.units > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-accent-gold">★</span>
          <span>{pkg.revisions === 'unlimited' ? 'Unlimited' : pkg.revisions} revision{typeof pkg.revisions === 'number' && pkg.revisions > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-accent-gold">★</span>
          <span>{pkg.deliveryDays} business day delivery</span>
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {pkg.features.slice(1, 5).map((feature, idx) => (
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
  )

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-soft-cream rounded-xl p-1.5 flex-wrap justify-center gap-1">
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'kitchen'
                ? 'bg-warm-white text-brand-700 shadow-sm'
                : 'text-muted hover:text-brand-600'
            }`}
          >
            <span>🍳</span> Kitchen Packages
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'wardrobe'
                ? 'bg-warm-white text-brand-700 shadow-sm'
                : 'text-muted hover:text-brand-600'
            }`}
          >
            <span>👔</span> Wardrobe Packages
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'subscription'
                ? 'bg-warm-white text-brand-700 shadow-sm'
                : 'text-muted hover:text-brand-600'
            }`}
          >
            <span>📦</span> Subscriptions
          </button>
        </div>
      </div>

      {/* Kitchen Packages */}
      {activeTab === 'kitchen' && (
        <div className="grid md:grid-cols-3 gap-6">
          {kitchenPackages.map(renderPackageCard)}
        </div>
      )}

      {/* Wardrobe Packages */}
      {activeTab === 'wardrobe' && (
        <div className="grid md:grid-cols-3 gap-6">
          {wardrobePackages.map(renderPackageCard)}
        </div>
      )}

      {/* Billing Cycle Toggle (for subscriptions) */}
      {activeTab === 'subscription' && (
        <>
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

          {/* Subscription Plans */}
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
        </>
      )}

      {/* Money-back guarantee */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          100% Satisfaction Guarantee
        </div>
      </div>
    </div>
  )
}
