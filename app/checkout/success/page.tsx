// app/checkout/success/page.tsx
// Success page after successful payment
// Supports both Stripe checkout sessions and MYOB invoice payments

export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SuccessContent } from './SuccessContent'
import { PaymentStatusChecker } from './PaymentStatusChecker'

interface SuccessPageProps {
  searchParams: {
    session_id?: string
    payment_id?: string
    check_status?: string
  }
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id, payment_id, check_status } = searchParams

  // Get current user
  const user = await getCurrentUser()

  // If checking status or has payment_id, this is an MYOB flow
  if (check_status || payment_id) {
    if (!user) {
      redirect('/auth/login?redirect=/checkout/success?check_status=true')
    }

    // Get the latest pending payment for this user
    const pendingPayment = payment_id
      ? await prisma.payment.findUnique({ where: { id: payment_id } })
      : await prisma.payment.findFirst({
          where: { userId: user.id, status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
        })

    if (!pendingPayment) {
      // No pending payment, check for recent paid payment
      const recentPaidPayment = await prisma.payment.findFirst({
        where: { userId: user.id, status: 'PAID' },
        orderBy: { paidAt: 'desc' },
      })

      if (recentPaidPayment && recentPaidPayment.paidAt) {
        // Check if paid within last 24 hours
        const hoursSincePaid = (Date.now() - recentPaidPayment.paidAt.getTime()) / (1000 * 60 * 60)
        if (hoursSincePaid < 24) {
          return (
            <SuccessPageLayout>
              <SuccessContent
                mode="payment"
                type={recentPaidPayment.type === 'SUBSCRIPTION' ? 'subscription' : 'one_time'}
                isLoggedIn={true}
              />
            </SuccessPageLayout>
          )
        }
      }

      // No recent payment found
      return (
        <SuccessPageLayout>
          <div className="bg-warm-white rounded-2xl p-8 border border-border text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-display font-bold text-brand-700 mb-3">
              No Pending Payments
            </h1>
            <p className="text-muted mb-6">
              You don&apos;t have any pending payments to check.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-brand-600 text-warm-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3 border-2 border-brand-600 text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </SuccessPageLayout>
      )
    }

    // Show payment status checker for pending MYOB payment
    return (
      <SuccessPageLayout>
        <PaymentStatusChecker
          paymentId={pendingPayment.id}
          invoiceNumber={pendingPayment.invoiceNumber || undefined}
          invoiceUrl={pendingPayment.invoiceUrl || undefined}
          amount={pendingPayment.amount}
          description={pendingPayment.description}
          initialStatus={pendingPayment.status}
        />
      </SuccessPageLayout>
    )
  }

  // Stripe flow - require session_id
  if (!session_id) {
    redirect('/pricing')
  }

  // Dynamically import Stripe function only when needed
  const { getCheckoutSessionStatus } = await import('@/lib/stripe')

  // Fetch session status from Stripe
  let sessionStatus
  try {
    sessionStatus = await getCheckoutSessionStatus(session_id)
  } catch (error) {
    console.error('Error fetching session status:', error)
    sessionStatus = null
  }

  // Check if payment was successful
  const isComplete = sessionStatus?.status === 'complete'
  const isPaid = sessionStatus?.paymentStatus === 'paid'
  const mode = sessionStatus?.mode
  const metadata = sessionStatus?.metadata || {}

  return (
    <SuccessPageLayout>
      {isComplete && isPaid ? (
        <SuccessContent
          mode={mode || 'payment'}
          type={metadata.type as 'one_time' | 'subscription'}
          packageType={metadata.packageType}
          planType={metadata.planType}
          isLoggedIn={!!user}
        />
      ) : isComplete ? (
        // Payment processing
        <div className="bg-warm-white rounded-2xl p-8 border border-border text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-brand-700 mb-3">
            Payment Processing
          </h1>
          <p className="text-muted mb-6">
            Your payment is being processed. This usually takes just a few seconds.
            You&apos;ll receive an email confirmation once complete.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 bg-brand-600 text-warm-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        // Session not found or expired
        <div className="bg-warm-white rounded-2xl p-8 border border-border text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-brand-700 mb-3">
            Session Not Found
          </h1>
          <p className="text-muted mb-6">
            We couldn&apos;t find this checkout session. It may have expired or the payment may still be processing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-brand-600 text-warm-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 border-2 border-brand-600 text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      )}
    </SuccessPageLayout>
  )
}

// Layout wrapper component
function SuccessPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-soft-cream flex flex-col">
      {/* Navigation */}
      <nav className="px-[4%] py-5 flex justify-between items-center bg-warm-white border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-warm-white font-bold text-sm">CV</span>
          </div>
          <span className="font-display text-xl font-semibold text-brand-600">CabinetViz</span>
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-lg w-full">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-[4%] py-6 border-t border-border text-center text-sm text-muted bg-warm-white">
        <p>Need help? <Link href="/contact" className="text-brand-600 hover:underline">Contact our support team</Link></p>
      </footer>
    </div>
  )
}
