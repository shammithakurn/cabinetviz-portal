// lib/myob-client.ts
// Client-side utilities for MYOB payment integration
// Safe to use in client components - no secret credentials

import type { OneTimePackageType, SubscriptionPlanType, BillingCycle } from '@/lib/constants/pricing'

// ============================================
// TYPES
// ============================================

export interface CreateInvoiceResponse {
  success: boolean
  invoiceUID?: string
  invoiceNumber?: string
  paymentUrl?: string
  totalAmount?: number
  error?: string
}

export interface PaymentStatusResponse {
  success: boolean
  status?: string
  isPaid?: boolean
  error?: string
}

export interface MYOBAuthStatusResponse {
  isConfigured: boolean
  isAuthenticated: boolean
  authUrl?: string
}

// ============================================
// INVOICE CREATION
// ============================================

/**
 * Create an invoice for a one-time package purchase
 */
export async function createOneTimeInvoice(
  packageType: OneTimePackageType,
  jobId?: string
): Promise<CreateInvoiceResponse> {
  try {
    const response = await fetch('/api/myob/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'one_time',
        packageType,
        jobId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create invoice',
      }
    }

    return {
      success: true,
      invoiceUID: data.invoiceUID,
      invoiceNumber: data.invoiceNumber,
      paymentUrl: data.paymentUrl,
      totalAmount: data.totalAmount,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Create an invoice for a subscription
 */
export async function createSubscriptionInvoice(
  planType: SubscriptionPlanType,
  billingCycle: BillingCycle
): Promise<CreateInvoiceResponse> {
  try {
    const response = await fetch('/api/myob/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'subscription',
        planType,
        billingCycle,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create invoice',
      }
    }

    return {
      success: true,
      invoiceUID: data.invoiceUID,
      invoiceNumber: data.invoiceNumber,
      paymentUrl: data.paymentUrl,
      totalAmount: data.totalAmount,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============================================
// PAYMENT STATUS
// ============================================

/**
 * Check the payment status of an invoice
 */
export async function checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  try {
    const response = await fetch(`/api/myob/payment-status?paymentId=${paymentId}`)
    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to check payment status',
      }
    }

    return {
      success: true,
      status: data.status,
      isPaid: data.isPaid,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

/**
 * Poll for payment completion
 * @param paymentId - The payment ID to check
 * @param onPaid - Callback when payment is confirmed
 * @param interval - Polling interval in ms (default 5000)
 * @param maxAttempts - Maximum polling attempts (default 60 = 5 minutes)
 */
export function pollPaymentStatus(
  paymentId: string,
  onPaid: () => void,
  interval = 5000,
  maxAttempts = 60
): () => void {
  let attempts = 0
  let timeoutId: NodeJS.Timeout | null = null

  const poll = async () => {
    attempts++

    const result = await checkPaymentStatus(paymentId)

    if (result.isPaid) {
      onPaid()
      return
    }

    if (attempts < maxAttempts) {
      timeoutId = setTimeout(poll, interval)
    }
  }

  // Start polling
  poll()

  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

// ============================================
// AUTHENTICATION STATUS
// ============================================

/**
 * Check if MYOB is configured and authenticated
 */
export async function getMYOBAuthStatus(): Promise<MYOBAuthStatusResponse> {
  try {
    const response = await fetch('/api/myob/auth/status')
    const data = await response.json()

    return {
      isConfigured: data.isConfigured,
      isAuthenticated: data.isAuthenticated,
      authUrl: data.authUrl,
    }
  } catch {
    return {
      isConfigured: false,
      isAuthenticated: false,
    }
  }
}

/**
 * Open the MYOB payment page
 */
export function openPaymentPage(paymentUrl: string): void {
  window.open(paymentUrl, '_blank', 'noopener,noreferrer')
}

/**
 * Redirect to the MYOB payment page
 */
export function redirectToPayment(paymentUrl: string): void {
  window.location.href = paymentUrl
}
