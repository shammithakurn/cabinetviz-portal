'use client'

// app/checkout/success/PaymentStatusChecker.tsx
// Client component for checking MYOB payment status

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { checkPaymentStatus, openPaymentPage } from '@/lib/myob-client'

interface PaymentStatusCheckerProps {
  paymentId: string
  invoiceNumber?: string
  invoiceUrl?: string
  amount: number
  description: string
  initialStatus: string
}

export function PaymentStatusChecker({
  paymentId,
  invoiceNumber,
  invoiceUrl,
  amount,
  description,
  initialStatus,
}: PaymentStatusCheckerProps) {
  const [status, setStatus] = useState(initialStatus)
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkStatus = useCallback(async () => {
    setChecking(true)
    try {
      const result = await checkPaymentStatus(paymentId)
      if (result.success && result.status) {
        setStatus(result.status)
        if (result.isPaid) {
          // Payment confirmed!
          setStatus('PAID')
        }
      }
      setLastChecked(new Date())
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setChecking(false)
    }
  }, [paymentId])

  // Auto-check status on mount and every 10 seconds
  useEffect(() => {
    checkStatus()

    const interval = setInterval(checkStatus, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [checkStatus])

  if (status === 'PAID') {
    return (
      <div className="bg-warm-white rounded-2xl p-8 border border-border text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-display font-bold text-brand-700 mb-3">
          Payment Confirmed!
        </h1>
        <p className="text-muted mb-2">
          Thank you for your purchase.
        </p>
        {invoiceNumber && (
          <p className="text-sm text-muted mb-6">
            Invoice #{invoiceNumber}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-brand-600 text-warm-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/jobs/new"
            className="px-6 py-3 border-2 border-brand-600 text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition-colors"
          >
            Start a New Project
          </Link>
        </div>
      </div>
    )
  }

  // Pending payment
  return (
    <div className="bg-warm-white rounded-2xl p-8 border border-border">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-display font-bold text-brand-700 mb-3">
          Awaiting Payment
        </h1>
        <p className="text-muted">
          Your invoice has been created. Complete your payment to continue.
        </p>
      </div>

      {/* Invoice Details */}
      <div className="bg-soft-cream rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted">Invoice</span>
          <span className="font-medium">{invoiceNumber || 'Pending'}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted">Description</span>
          <span className="font-medium text-right">{description}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="font-medium">Amount Due</span>
          <span className="text-xl font-bold text-brand-600">${amount.toFixed(2)} NZD</span>
        </div>
      </div>

      {/* Pay Now Button */}
      {invoiceUrl && (
        <button
          onClick={() => openPaymentPage(invoiceUrl)}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Pay Now
        </button>
      )}

      {/* Status Check */}
      <div className="text-center">
        <button
          onClick={checkStatus}
          disabled={checking}
          className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 disabled:opacity-50"
        >
          {checking ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Check Payment Status
            </>
          )}
        </button>
        {lastChecked && (
          <p className="text-xs text-muted mt-1">
            Last checked: {lastChecked.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Payment Methods */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-center text-muted mb-3">Accepted payment methods:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">VISA</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">MasterCard</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">Apple Pay</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">Google Pay</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">PayPal</span>
        </div>
      </div>

      {/* Help */}
      <div className="mt-6 text-center">
        <p className="text-xs text-muted">
          Already paid but still seeing this page?{' '}
          <button onClick={checkStatus} className="text-brand-600 hover:underline">
            Refresh status
          </button>
          {' '}or{' '}
          <Link href="/contact" className="text-brand-600 hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
