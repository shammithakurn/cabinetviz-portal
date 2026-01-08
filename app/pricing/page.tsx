// app/pricing/page.tsx
// Pricing page showing one-time packages and subscription plans
// Integrates with Stripe for payment processing

export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import {
  getKitchenPackagesArray,
  getWardrobePackagesArray,
  getSubscriptionPlansArray,
  formatPrice,
  getYearlySavings,
} from '@/lib/constants/pricing'
import { PricingTabs } from '@/components/stripe/PricingTabs'

export const metadata: Metadata = {
  title: 'Pricing | CabinetViz',
  description: 'Choose the perfect plan for your cabinet visualization needs. One-time packages or subscription plans available.',
}

export default async function PricingPage() {
  const user = await getCurrentUser()
  const kitchenPackages = getKitchenPackagesArray()
  const wardrobePackages = getWardrobePackagesArray()
  const subscriptionPlans = getSubscriptionPlansArray()

  // Calculate savings for each subscription plan
  const plansWithSavings = subscriptionPlans.map(plan => ({
    ...plan,
    yearlySavings: getYearlySavings(plan.id),
  }))

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Navigation */}
      <nav className="px-[4%] py-5 flex justify-between items-center bg-warm-white/95 backdrop-blur-xl border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-walnut rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CV</span>
          </div>
          <span className="font-display text-xl font-semibold text-walnut">CabinetViz</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-walnut text-white rounded-lg font-medium hover:bg-walnut-dark transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-walnut font-medium hover:text-accent transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 bg-walnut text-white rounded-lg font-medium hover:bg-walnut-dark transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Header */}
      <section className="px-[4%] py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-lg text-text-light max-w-2xl mx-auto">
          Choose a one-time package for individual projects or subscribe for ongoing savings.
          All prices in NZD. International payments accepted.
        </p>
      </section>

      {/* Pricing Content */}
      <section className="px-[4%] pb-20">
        <PricingTabs
          kitchenPackages={kitchenPackages}
          wardrobePackages={wardrobePackages}
          subscriptionPlans={plansWithSavings}
          isLoggedIn={!!user}
        />
      </section>

      {/* FAQ Section */}
      <section className="px-[4%] py-16 bg-dark-surface">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-charcoal text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express), as well as Apple Pay, Google Pay, and local payment methods depending on your region. All payments are processed securely through Stripe."
            />
            <FAQItem
              question="Can I change my subscription plan?"
              answer="Yes! You can upgrade or downgrade your subscription at any time. When upgrading, you'll be charged a prorated amount. When downgrading, the change takes effect at the end of your current billing period."
            />
            <FAQItem
              question="What happens if I exceed my monthly project limit?"
              answer="If you need more projects than your plan allows, you can either upgrade to a higher tier or purchase additional projects as one-time packages at our standard rates."
            />
            <FAQItem
              question="Do you offer refunds?"
              answer="We offer a 100% satisfaction guarantee. If you're not happy with your visualization within the first revision round, we'll refund your payment in full."
            />
            <FAQItem
              question="Is my payment information secure?"
              answer="Absolutely. We use Stripe for all payment processing, which is PCI DSS Level 1 certified—the highest level of security certification. We never store your card details on our servers."
            />
            <FAQItem
              question="Do you support international payments?"
              answer="Yes! We accept payments from customers worldwide. Prices are shown in NZD, but Stripe will handle currency conversion automatically based on your card's currency."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-[4%] py-16 text-center">
        <h2 className="text-2xl font-display font-bold text-charcoal mb-4">
          Still have questions?
        </h2>
        <p className="text-text-light mb-6">
          Our team is here to help you choose the right plan for your needs.
        </p>
        <a
          href="mailto:hello@cabinetviz.com"
          className="inline-block px-6 py-3 border-2 border-walnut text-walnut rounded-lg font-medium hover:bg-walnut hover:text-white transition-colors"
        >
          Contact Us
        </a>
      </section>

      {/* Footer */}
      <footer className="px-[4%] py-8 border-t border-border text-center text-sm text-text-muted">
        <p>&copy; {new Date().getFullYear()} CabinetViz. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/privacy" className="hover:text-walnut">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-walnut">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-dark-elevated rounded-xl p-6 border border-dark-surface">
      <summary className="flex justify-between items-center cursor-pointer list-none">
        <span className="font-medium text-charcoal">{question}</span>
        <span className="ml-4 text-walnut group-open:rotate-180 transition-transform">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </summary>
      <p className="mt-4 text-text-light">{answer}</p>
    </details>
  )
}
