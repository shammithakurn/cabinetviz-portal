// app/api/myob/payment-status/route.ts
// API route for checking MYOB payment status

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { syncPaymentStatus, isMYOBConfigured } from '@/lib/myob'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get payment ID from query
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Verify the payment belongs to this user
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { userId: true, status: true },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // If MYOB is configured, sync the payment status
    if (isMYOBConfigured()) {
      const result = await syncPaymentStatus(paymentId)
      return NextResponse.json({
        status: result.status,
        isPaid: result.isPaid,
      })
    }

    // If MYOB is not configured, return current status from database
    return NextResponse.json({
      status: payment.status,
      isPaid: payment.status === 'PAID',
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check payment status' },
      { status: 500 }
    )
  }
}

// POST endpoint for manual status sync (admin use)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Verify the payment belongs to this user
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { userId: true },
    })

    if (!payment || payment.userId !== user.id) {
      return NextResponse.json(
        { error: 'Payment not found or unauthorized' },
        { status: 404 }
      )
    }

    if (!isMYOBConfigured()) {
      return NextResponse.json(
        { error: 'MYOB is not configured' },
        { status: 503 }
      )
    }

    const result = await syncPaymentStatus(paymentId)

    return NextResponse.json({
      status: result.status,
      isPaid: result.isPaid,
      message: result.isPaid ? 'Payment confirmed' : 'Payment not yet received',
    })
  } catch (error) {
    console.error('Error syncing payment status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync payment status' },
      { status: 500 }
    )
  }
}
