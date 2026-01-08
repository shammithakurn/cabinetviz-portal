'use client'

// components/HomePricingTabs.tsx
// Client component for homepage pricing with Kitchen/Wardrobe tabs

import { useState } from 'react'
import Link from 'next/link'

interface PricingPackage {
  name: string
  subtitle: string
  price: string
  period: string
  featured?: boolean
  features: string[]
}

interface HomePricingTabsProps {
  kitchenPackages: PricingPackage[]
  wardrobePackages: PricingPackage[]
}

export function HomePricingTabs({ kitchenPackages, wardrobePackages }: HomePricingTabsProps) {
  const [activeTab, setActiveTab] = useState<'kitchen' | 'wardrobe'>('kitchen')

  const packages = activeTab === 'kitchen' ? kitchenPackages : wardrobePackages

  return (
    <div className="relative z-10">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex bg-dark-elevated rounded-xl p-1.5 gap-1">
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
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {packages.map((pkg, i) => (
          <PricingCard
            key={`${activeTab}-${i}`}
            name={pkg.name}
            subtitle={pkg.subtitle}
            price={pkg.price}
            period={pkg.period}
            features={pkg.features}
            featured={pkg.featured}
          />
        ))}
      </div>

      {/* View All Link */}
      <div className="text-center mt-10">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-walnut hover:text-accent font-medium transition-colors"
        >
          View all packages & subscriptions
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function PricingCard({ name, subtitle, price, period, features, featured = false }: {
  name: string
  subtitle: string
  price: string
  period: string
  features: string[]
  featured?: boolean
}) {
  return (
    <div className={`rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 ${
      featured
        ? 'bg-gradient-to-br from-walnut to-walnut-dark text-white shadow-2xl scale-105 relative z-10'
        : 'bg-dark-elevated text-charcoal hover:shadow-xl'
    }`}>
      {featured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-dark-bg text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
            Best Value
          </span>
        </div>
      )}
      <div className="text-center mb-8">
        <h3 className={`text-xl font-display font-semibold ${featured ? 'text-white' : 'text-charcoal'}`}>
          {name}
        </h3>
        <p className={`text-sm mt-1 ${featured ? 'text-white/80' : 'text-text-muted'}`}>
          {subtitle}
        </p>
        <div className="mt-4">
          <span className={`text-5xl font-bold ${featured ? 'text-white' : 'text-walnut'}`}>
            {price}
          </span>
          {period && (
            <span className={`text-sm ${featured ? 'text-white/70' : 'text-text-muted'}`}>
              {period}
            </span>
          )}
        </div>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${featured ? 'text-accent' : 'text-walnut'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`text-sm ${featured ? 'text-white/90' : 'text-text-light'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/pricing"
        className={`block w-full py-3.5 rounded-xl font-semibold text-center transition-all ${
          featured
            ? 'bg-white text-walnut hover:bg-cream'
            : 'bg-walnut text-white hover:bg-walnut-dark'
        }`}
      >
        Get Started
      </Link>
    </div>
  )
}
