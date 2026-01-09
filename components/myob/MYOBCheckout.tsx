'use client'

// components/myob/MYOBCheckout.tsx
// MYOB Invoice-based checkout component
// Creates an invoice in MYOB and redirects to MYOB PayDirect for payment

import { useState, useCallback } from 'react'
import { createOneTimeInvoice, createSubscriptionInvoice, openPaymentPage } from '@/lib/myob-client'
import type { SubscriptionPlanType, BillingCycle } from '@/lib/constants/pricing'

interface MYOBCheckoutProps {
  type: 'one_time' | 'subscription'
  packageId?: string // Package ID like KITCHEN_BASIC, WARDROBE_SINGLE_WALL
  planType?: SubscriptionPlanType
  billingCycle: BillingCycle
  jobId?: string
  productName: string
  productPrice: number
}

type CheckoutState = 'idle' | 'creating' | 'ready' | 'error'

export function MYOBCheckout({
  type,
  packageId,
  planType,
  billingCycle,
  jobId,
  productName,
  productPrice,
}: MYOBCheckoutProps) {
  const [state, setState] = useState<CheckoutState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [invoiceDetails, setInvoiceDetails] = useState<{
    invoiceNumber: string
    paymentUrl: string
  } | null>(null)

  const createInvoice = useCallback(async () => {
    setState('creating')
    setError(null)

    try {
      let result

      if (type === 'one_time' && packageId) {
        result = await createOneTimeInvoice(packageId, jobId)
      } else if (type === 'subscription' && planType) {
        result = await createSubscriptionInvoice(planType, billingCycle)
      } else {
        throw new Error('Invalid checkout configuration')
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create invoice')
      }

      setInvoiceDetails({
        invoiceNumber: result.invoiceNumber || '',
        paymentUrl: result.paymentUrl || '',
      })
      setState('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setState('error')
    }
  }, [type, packageId, planType, billingCycle, jobId])

  const handlePayNow = () => {
    if (invoiceDetails?.paymentUrl) {
      openPaymentPage(invoiceDetails.paymentUrl)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods Banner */}
      <div className="bg-soft-cream rounded-xl p-4">
        <p className="text-sm text-muted mb-3">Accepted payment methods:</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-warm-white rounded-lg px-3 py-2 border border-border">
            <svg className="w-8 h-5" viewBox="0 0 50 30" fill="none">
              <rect width="50" height="30" rx="4" fill="#1A1F71"/>
              <text x="25" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">VISA</text>
            </svg>
          </div>
          <div className="flex items-center gap-2 bg-warm-white rounded-lg px-3 py-2 border border-border">
            <svg className="w-8 h-5" viewBox="0 0 50 30" fill="none">
              <rect width="50" height="30" rx="4" fill="#EB001B"/>
              <circle cx="20" cy="15" r="10" fill="#EB001B"/>
              <circle cx="30" cy="15" r="10" fill="#F79E1B"/>
            </svg>
          </div>
          <div className="flex items-center gap-2 bg-warm-white rounded-lg px-3 py-2 border border-border">
            <span className="text-xs font-medium text-gray-700">Apple Pay</span>
          </div>
          <div className="flex items-center gap-2 bg-warm-white rounded-lg px-3 py-2 border border-border">
            <span className="text-xs font-medium text-gray-700">Google Pay</span>
          </div>
          <div className="flex items-center gap-2 bg-warm-white rounded-lg px-3 py-2 border border-border">
            <span className="text-xs font-medium text-[#003087]">PayPal</span>
          </div>
        </div>
      </div>

      {/* State: Idle - Show Create Invoice Button */}
      {state === 'idle' && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Click below to generate your invoice. You&apos;ll be able to pay securely using your preferred payment method.
          </p>
          <button
            onClick={createInvoice}
            className="w-full py-4 bg-brand-600 text-warm-white rounded-xl font-semibold text-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Invoice
          </button>
        </div>
      )}

      {/* State: Creating Invoice */}
      {state === 'creating' && (
        <div className="py-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-brand-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="font-semibold text-brand-700 mb-2">Creating Your Invoice</h3>
          <p className="text-sm text-muted">Please wait while we generate your invoice...</p>
        </div>
      )}

      {/* State: Invoice Ready */}
      {state === 'ready' && invoiceDetails && (
        <div className="space-y-4">
          {/* Invoice Created Success */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Invoice Created</h4>
                <p className="text-sm text-green-700 mt-1">
                  Invoice #{invoiceDetails.invoiceNumber} has been created for {productName}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-warm-white border border-border rounded-xl p-6 text-center">
            <h3 className="font-display text-lg font-bold text-brand-700 mb-2">
              Complete Your Payment
            </h3>
            <p className="text-muted mb-6">
              Click the button below to pay securely via our payment portal.
              You can use credit card, Apple Pay, Google Pay, or PayPal.
            </p>

            <button
              onClick={handlePayNow}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pay Now - ${productPrice.toFixed(2)} NZD
            </button>

            <p className="text-xs text-muted mt-4">
              Opens in a new tab. After payment, return here to check your payment status.
            </p>
          </div>

          {/* Check Payment Status Link */}
          <div className="text-center">
            <a
              href="/checkout/success?check_status=true"
              className="text-sm text-brand-600 hover:underline"
            >
              Already paid? Check payment status
            </a>
          </div>
        </div>
      )}

      {/* State: Error */}
      {state === 'error' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Error Creating Invoice</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setState('idle')}
            className="w-full py-3 border-2 border-brand-600 text-brand-600 rounded-xl font-medium hover:bg-brand-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-2 text-xs text-muted justify-center">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secure payment powered by MYOB PayDirect (Stripe)
      </div>
    </div>
  )
}
