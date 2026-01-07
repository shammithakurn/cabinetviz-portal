// app/api/myob/invoice/route.ts
// API route for creating MYOB invoices

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  isMYOBConfigured,
  createOneTimePackageInvoice,
  createSubscriptionInvoice,
} from '@/lib/myob'
import type { OneTimePackageType, SubscriptionPlanType, BillingCycle } from '@/lib/constants/pricing'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check MYOB configuration
    if (!isMYOBConfigured()) {
      return NextResponse.json(
        { error: 'MYOB is not configured. Please contact support.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { type, packageType, planType, billingCycle, jobId } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Invoice type is required' },
        { status: 400 }
      )
    }

    let result

    if (type === 'one_time') {
      // Validate one-time package
      if (!packageType) {
        return NextResponse.json(
          { error: 'Package type is required for one-time purchases' },
          { status: 400 }
        )
      }

      const validPackages: OneTimePackageType[] = ['BASIC', 'PROFESSIONAL', 'PREMIUM']
      if (!validPackages.includes(packageType)) {
        return NextResponse.json(
          { error: 'Invalid package type' },
          { status: 400 }
        )
      }

      result = await createOneTimePackageInvoice(
        user.id,
        user.email,
        user.name || 'Customer',
        packageType as OneTimePackageType,
        jobId
      )
    } else if (type === 'subscription') {
      // Validate subscription
      if (!planType || !billingCycle) {
        return NextResponse.json(
          { error: 'Plan type and billing cycle are required for subscriptions' },
          { status: 400 }
        )
      }

      const validPlans: SubscriptionPlanType[] = ['STARTER', 'PRO', 'ENTERPRISE']
      const validCycles: BillingCycle[] = ['MONTHLY', 'YEARLY']

      if (!validPlans.includes(planType)) {
        return NextResponse.json(
          { error: 'Invalid plan type' },
          { status: 400 }
        )
      }

      if (!validCycles.includes(billingCycle)) {
        return NextResponse.json(
          { error: 'Invalid billing cycle' },
          { status: 400 }
        )
      }

      result = await createSubscriptionInvoice(
        user.id,
        user.email,
        user.name || 'Customer',
        planType as SubscriptionPlanType,
        billingCycle as BillingCycle
      )
    } else {
      return NextResponse.json(
        { error: 'Invalid invoice type. Must be "one_time" or "subscription"' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      invoiceUID: result.invoiceUID,
      invoiceNumber: result.invoiceNumber,
      paymentUrl: result.paymentUrl,
      totalAmount: result.totalAmount,
    })
  } catch (error) {
    console.error('Error creating MYOB invoice:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 }
    )
  }
}
