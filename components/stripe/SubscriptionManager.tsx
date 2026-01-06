'use client'

// components/stripe/SubscriptionManager.tsx
// Component for managing subscriptions in the dashboard

import { useState } from 'react'
import Link from 'next/link'
import {
  createPortalSession,
  cancelSubscription,
  resumeSubscription,
} from '@/lib/stripe-client'
import { formatPrice } from '@/lib/constants/pricing'

interface SubscriptionData {
  id: string
  plan: string
  status: string
  billingCycle: string
  pricePerCycle: number
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  projectsUsedThisMonth: number
  projectsLimit: number
}

interface SubscriptionManagerProps {
  subscription: SubscriptionData | null
}

export function SubscriptionManager({ subscription }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleOpenPortal = async () => {
    setLoading('portal')
    setMessage(null)
    try {
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to open portal',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.')) {
      return
    }

    setLoading('cancel')
    setMessage(null)
    try {
      await cancelSubscription()
      setMessage({
        type: 'success',
        text: 'Your subscription will be cancelled at the end of the current billing period.',
      })
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to cancel subscription',
      })
    } finally {
      setLoading(null)
    }
  }

  const handleResumeSubscription = async () => {
    setLoading('resume')
    setMessage(null)
    try {
      await resumeSubscription()
      setMessage({
        type: 'success',
        text: 'Your subscription has been resumed.',
      })
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to resume subscription',
      })
    } finally {
      setLoading(null)
    }
  }

  // No subscription
  if (!subscription) {
    return (
      <div className="bg-warm-white rounded-2xl p-6 border border-border">
        <h2 className="font-display text-xl font-bold text-brand-700 mb-4">
          Subscription
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-soft-cream rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="font-semibold text-brand-700 mb-2">No Active Subscription</h3>
          <p className="text-muted mb-6">
            Subscribe to get more projects per month and save on your visualizations.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-3 bg-brand-600 text-warm-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  const isActive = subscription.status === 'ACTIVE'
  const isPastDue = subscription.status === 'PAST_DUE'
  const isCancelling = subscription.cancelAtPeriodEnd

  return (
    <div className="bg-warm-white rounded-2xl p-6 border border-border">
      <h2 className="font-display text-xl font-bold text-brand-700 mb-4">
        Subscription
      </h2>

      {/* Status Messages */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Plan Details */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg text-brand-700">{subscription.plan} Plan</h3>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                isActive && !isCancelling
                  ? 'bg-green-100 text-green-700'
                  : isPastDue
                  ? 'bg-red-100 text-red-700'
                  : isCancelling
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {isCancelling ? 'Cancelling' : subscription.status}
            </span>
          </div>
          <p className="text-muted mt-1">
            {formatPrice(subscription.pricePerCycle)} / {subscription.billingCycle.toLowerCase()}
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-sm text-muted">
            {isCancelling ? 'Access ends' : 'Next billing date'}
          </p>
          <p className="font-medium">
            {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-NZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-soft-cream rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Monthly Project Usage</span>
          <span className="text-sm text-muted">
            {subscription.projectsUsedThisMonth} / {subscription.projectsLimit}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all"
            style={{
              width: `${Math.min(
                (subscription.projectsUsedThisMonth / subscription.projectsLimit) * 100,
                100
              )}%`,
            }}
          />
        </div>
        {subscription.projectsUsedThisMonth >= subscription.projectsLimit && (
          <p className="text-xs text-yellow-600 mt-2">
            You&apos;ve reached your monthly limit. Upgrade for more projects.
          </p>
        )}
      </div>

      {/* Past Due Warning */}
      {isPastDue && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 text-sm">
            Your payment failed. Please update your payment method to continue using your subscription.
          </p>
        </div>
      )}

      {/* Cancellation Notice */}
      {isCancelling && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-700 text-sm">
            Your subscription is set to cancel at the end of the current billing period.
            You can resume your subscription at any time before then.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleOpenPortal}
          disabled={loading === 'portal'}
          className="px-4 py-2 bg-brand-600 text-warm-white rounded-lg font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {loading === 'portal' ? 'Loading...' : 'Manage Billing'}
        </button>

        {isCancelling ? (
          <button
            onClick={handleResumeSubscription}
            disabled={loading === 'resume'}
            className="px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {loading === 'resume' ? 'Resuming...' : 'Resume Subscription'}
          </button>
        ) : isActive ? (
          <button
            onClick={handleCancelSubscription}
            disabled={loading === 'cancel'}
            className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loading === 'cancel' ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        ) : null}

        <Link
          href="/pricing"
          className="px-4 py-2 border-2 border-brand-600 text-brand-600 rounded-lg font-medium hover:bg-brand-50 transition-colors"
        >
          {isActive ? 'Change Plan' : 'View Plans'}
        </Link>
      </div>
    </div>
  )
}
