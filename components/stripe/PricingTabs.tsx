'use client'

// components/stripe/PricingTabs.tsx
// Client component for pricing page with Kitchen/Wardrobe tabs
// Styled to match homepage dark theme

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
  const [activeTab, setActiveTab] = useState<'kitchen' | 'wardrobe'>('kitchen')
  // Subscription features hidden for now - can be re-enabled later
  // const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')
  const router = useRouter()

  const handleSelectPackage = (packageId: string) => {
    console.log('Package selected:', packageId, 'isLoggedIn:', isLoggedIn)
    if (!isLoggedIn) {
      const redirectUrl = `/auth/login?redirect=/checkout?type=one_time&package=${packageId}`
      console.log('Redirecting to:', redirectUrl)
      router.push(redirectUrl)
      return
    }
    const checkoutUrl = `/checkout?type=one_time&package=${packageId}`
    console.log('Redirecting to checkout:', checkoutUrl)
    router.push(checkoutUrl)
  }

  // Subscription handler hidden for now - can be re-enabled later
  // const handleSelectPlan = (planId: string) => {
  //   if (!isLoggedIn) {
  //     router.push(`/auth/login?redirect=/checkout?type=subscription&plan=${planId}&billing=${billingCycle}`)
  //     return
  //   }
  //   router.push(`/checkout?type=subscription&plan=${planId}&billing=${billingCycle}`)
  // }

  const renderPackageCard = (pkg: Package) => (
    <div
      key={pkg.id}
      className={`rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
        pkg.popular
          ? 'bg-gradient-to-br from-walnut to-walnut-dark text-white shadow-2xl scale-105 relative z-10'
          : 'bg-dark-elevated text-charcoal hover:shadow-xl'
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-dark-bg text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
            Best Value
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          {pkg.category === 'KITCHEN' ? (
            <span className="text-2xl">🍳</span>
          ) : (
            <span className="text-2xl">👔</span>
          )}
          <h3 className={`text-xl font-display font-semibold ${pkg.popular ? 'text-white' : 'text-charcoal'}`}>
            {pkg.name}
          </h3>
        </div>
        <p className={`text-sm mt-1 ${pkg.popular ? 'text-white/80' : 'text-text-muted'}`}>
          {pkg.description}
        </p>
        <div className="mt-4">
          <span className={`text-5xl font-bold ${pkg.popular ? 'text-white' : 'text-walnut'}`}>
            {pkg.priceLabel}
          </span>
          <span className={`text-sm ml-1 ${pkg.popular ? 'text-white/70' : 'text-text-muted'}`}>
            {pkg.perUnit ? '/each (min 5)' : 'one-time'}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className={`flex items-center gap-2 text-sm font-medium ${pkg.popular ? 'text-white' : 'text-charcoal'}`}>
          <span className={pkg.popular ? 'text-accent' : 'text-walnut'}>★</span>
          <span>
            {pkg.perUnit ? `${pkg.units}+ ${pkg.unitLabel}s` : `${pkg.units} ${pkg.unitLabel}${pkg.units > 1 ? 's' : ''}`}
          </span>
        </div>
        <div className={`flex items-center gap-2 text-sm ${pkg.popular ? 'text-white/90' : 'text-text-light'}`}>
          <span className={pkg.popular ? 'text-accent' : 'text-walnut'}>★</span>
          <span>{pkg.revisions === 'unlimited' ? 'Unlimited' : pkg.revisions} revision{typeof pkg.revisions === 'number' && pkg.revisions > 1 ? 's' : ''}</span>
        </div>
        <div className={`flex items-center gap-2 text-sm ${pkg.popular ? 'text-white/90' : 'text-text-light'}`}>
          <span className={pkg.popular ? 'text-accent' : 'text-walnut'}>★</span>
          <span>{pkg.deliveryDays} business day delivery</span>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {pkg.features.slice(0, 5).map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${pkg.popular ? 'text-accent' : 'text-walnut'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`text-sm ${pkg.popular ? 'text-white/90' : 'text-text-light'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => handleSelectPackage(pkg.id)}
        className={`block w-full py-3.5 rounded-xl font-semibold text-center transition-all ${
          pkg.popular
            ? 'bg-white text-walnut hover:bg-cream'
            : 'bg-walnut text-white hover:bg-walnut-dark'
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
        <div className="inline-flex bg-dark-elevated rounded-xl p-1.5 flex-wrap justify-center gap-1">
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'kitchen'
                ? 'bg-walnut text-white shadow-sm'
                : 'text-text-light hover:text-charcoal hover:bg-dark-surface'
            }`}
          >
            <span>🍳</span> Kitchen
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'wardrobe'
                ? 'bg-walnut text-white shadow-sm'
                : 'text-text-light hover:text-charcoal hover:bg-dark-surface'
            }`}
          >
            <span>👔</span> Wardrobe
          </button>
          {/* Subscription tab hidden for now - can be re-enabled later
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'subscription'
                ? 'bg-walnut text-white shadow-sm'
                : 'text-text-light hover:text-charcoal hover:bg-dark-surface'
            }`}
          >
            <span>📦</span> Subscriptions
          </button>
          */}
        </div>
      </div>

      {/* Kitchen Packages */}
      {activeTab === 'kitchen' && (
        <div className="grid md:grid-cols-3 gap-8">
          {kitchenPackages.map(renderPackageCard)}
        </div>
      )}

      {/* Wardrobe Packages */}
      {activeTab === 'wardrobe' && (
        <div className="grid md:grid-cols-3 gap-8">
          {wardrobePackages.map(renderPackageCard)}
        </div>
      )}

      {/* Subscription section hidden for now - can be re-enabled later
      {activeTab === 'subscription' && (
        <>
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-3 bg-dark-elevated rounded-full px-4 py-2">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-walnut text-white'
                    : 'text-text-light hover:text-charcoal'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'YEARLY'
                    ? 'bg-walnut text-white'
                    : 'text-text-light hover:text-charcoal'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-accent">Save ~17%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-walnut to-walnut-dark text-white shadow-2xl scale-105 relative z-10'
                    : 'bg-dark-elevated text-charcoal hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-dark-bg text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className={`text-xl font-display font-semibold ${plan.popular ? 'text-white' : 'text-charcoal'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 ${plan.popular ? 'text-white/80' : 'text-text-muted'}`}>
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-walnut'}`}>
                      {formatPrice(billingCycle === 'YEARLY' ? plan.yearlyMonthlyEquivalent : plan.monthlyPrice)}
                    </span>
                    <span className={`text-sm ml-1 ${plan.popular ? 'text-white/70' : 'text-text-muted'}`}>
                      /month{billingCycle === 'YEARLY' && ', billed yearly'}
                    </span>
                  </div>
                  {billingCycle === 'YEARLY' && plan.yearlySavings > 0 && (
                    <p className="text-xs text-green-400 mt-2">
                      Save {formatPrice(plan.yearlySavings)} per year
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className={`flex items-center gap-2 text-sm ${plan.popular ? 'text-white/90' : 'text-text-light'}`}>
                    <span className={plan.popular ? 'text-accent' : 'text-walnut'}>★</span>
                    <span>{plan.projectsPerMonth} projects/month</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${plan.popular ? 'text-white/90' : 'text-text-light'}`}>
                    <span className={plan.popular ? 'text-accent' : 'text-walnut'}>★</span>
                    <span>
                      {plan.rendersPerProject === 'unlimited'
                        ? 'Unlimited'
                        : plan.rendersPerProject}{' '}
                      renders/project
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${plan.popular ? 'text-white/90' : 'text-text-light'}`}>
                    <span className={plan.popular ? 'text-accent' : 'text-walnut'}>★</span>
                    <span>
                      {plan.revisionsPerProject === 'unlimited'
                        ? 'Unlimited'
                        : plan.revisionsPerProject}{' '}
                      revisions/project
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.slice(3).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-accent' : 'text-walnut'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${plan.popular ? 'text-white/90' : 'text-text-light'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`block w-full py-3.5 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? 'bg-white text-walnut hover:bg-cream'
                      : 'bg-walnut text-white hover:bg-walnut-dark'
                  }`}
                >
                  {isLoggedIn ? 'Subscribe Now' : 'Sign In to Subscribe'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      */}

      {/* Money-back guarantee */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 text-green-400 rounded-full text-sm border border-green-800/50">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          100% Satisfaction Guarantee
        </div>
      </div>
    </div>
  )
}
