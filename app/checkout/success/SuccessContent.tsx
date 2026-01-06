'use client'

// app/checkout/success/SuccessContent.tsx
// Client component for success page animations and interactivity

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createPortalSession } from '@/lib/stripe-client'

interface SuccessContentProps {
  mode: 'payment' | 'subscription' | 'setup'
  type?: 'one_time' | 'subscription'
  packageType?: string
  planType?: string
  isLoggedIn: boolean
}

export function SuccessContent({
  mode,
  type,
  packageType,
  planType,
  isLoggedIn,
}: SuccessContentProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const [loadingPortal, setLoadingPortal] = useState(false)

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const handleManageSubscription = async () => {
    setLoadingPortal(true)
    try {
      const { url } = await createPortalSession()
      window.location.href = url
    } catch (error) {
      console.error('Error creating portal session:', error)
      alert('Unable to open subscription management. Please try again.')
    } finally {
      setLoadingPortal(false)
    }
  }

  const isSubscription = mode === 'subscription' || type === 'subscription'
  const productName = isSubscription
    ? `${planType || 'Pro'} Plan`
    : `${packageType || 'Professional'} Package`

  return (
    <div className="bg-warm-white rounded-2xl p-8 border border-border text-center relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#D4A72C', '#5D4E37', '#C4A77D', '#E8D5B7'][
                  Math.floor(Math.random() * 4)
                ],
              }}
            />
          ))}
        </div>
      )}

      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Success Message */}
      <h1 className="text-2xl font-display font-bold text-brand-700 mb-3">
        {isSubscription ? 'Welcome Aboard!' : 'Payment Successful!'}
      </h1>

      <p className="text-lg text-muted mb-2">
        Thank you for your purchase!
      </p>

      <p className="text-muted mb-6">
        {isSubscription
          ? `Your ${productName} subscription is now active. You can start creating projects right away.`
          : `Your ${productName} has been purchased. We'll start working on your project immediately.`}
      </p>

      {/* What's Next Section */}
      <div className="bg-soft-cream rounded-xl p-6 mb-6 text-left">
        <h2 className="font-semibold text-brand-700 mb-4">What happens next?</h2>
        <ol className="space-y-3">
          {isSubscription ? (
            <>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-600 text-warm-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  1
                </span>
                <span className="text-sm text-muted">
                  You&apos;ll receive a confirmation email with your subscription details
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-600 text-warm-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  2
                </span>
                <span className="text-sm text-muted">
                  Access your dashboard to create your first project
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-600 text-warm-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  3
                </span>
                <span className="text-sm text-muted">
                  Manage your subscription, payment methods, and invoices anytime
                </span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-600 text-warm-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  1
                </span>
                <span className="text-sm text-muted">
                  You&apos;ll receive a confirmation email with your receipt
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-600 text-warm-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  2
                </span>
                <span className="text-sm text-muted">
                  Our team will review your project requirements
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-600 text-warm-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                  3
                </span>
                <span className="text-sm text-muted">
                  You&apos;ll receive your visualizations within the promised delivery time
                </span>
              </li>
            </>
          )}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {isLoggedIn ? (
          <>
            <Link
              href={isSubscription ? '/jobs/new' : '/dashboard'}
              className="px-6 py-3 bg-brand-600 text-warm-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              {isSubscription ? 'Create Your First Project' : 'Go to Dashboard'}
            </Link>
            {isSubscription && (
              <button
                onClick={handleManageSubscription}
                disabled={loadingPortal}
                className="px-6 py-3 border-2 border-brand-600 text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition-colors disabled:opacity-50"
              >
                {loadingPortal ? 'Loading...' : 'Manage Subscription'}
              </button>
            )}
          </>
        ) : (
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-brand-600 text-warm-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            Sign In to Continue
          </Link>
        )}
      </div>

      {/* Confetti Styles */}
      <style jsx>{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -20px;
          animation: confetti-fall 3s ease-out forwards;
          opacity: 0.8;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-once {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-bounce-once {
          animation: bounce-once 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}
