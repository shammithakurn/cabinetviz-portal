// app/api/admin/subscriptions/[id]/route.ts
// API routes for managing individual subscriptions

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - Get single subscription details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
            jobs: {
              where: {
                createdAt: {
                  gte: new Date(new Date().setDate(1)) // This month
                }
              },
              select: { id: true, title: true, status: true, createdAt: true }
            }
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Get payment history for this user's subscription
    const payments = await prisma.payment.findMany({
      where: {
        userId: subscription.userId,
        type: 'SUBSCRIPTION'
      },
      orderBy: { createdAt: 'desc' },
      take: 12 // Last 12 payments
    })

    return NextResponse.json({ subscription, payments })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}

// PUT - Update subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, ...updateData } = body

    const subscription = await prisma.subscription.findUnique({ where: { id } })
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Handle specific actions
    if (action === 'pause') {
      const updated = await prisma.subscription.update({
        where: { id },
        data: { status: 'PAUSED' }
      })
      return NextResponse.json({ subscription: updated, message: 'Subscription paused' })
    }

    if (action === 'resume') {
      const updated = await prisma.subscription.update({
        where: { id },
        data: { status: 'ACTIVE' }
      })
      return NextResponse.json({ subscription: updated, message: 'Subscription resumed' })
    }

    if (action === 'cancel') {
      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date()
        }
      })
      return NextResponse.json({ subscription: updated, message: 'Subscription cancelled' })
    }

    if (action === 'renew') {
      // Extend the subscription by one billing cycle
      const now = new Date()
      const periodEnd = new Date(now)
      if (subscription.billingCycle === 'YEARLY') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      }

      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          projectsUsedThisMonth: 0,
          lastResetDate: now,
          cancelledAt: null
        }
      })

      // Create renewal payment
      await prisma.payment.create({
        data: {
          userId: subscription.userId,
          amount: subscription.pricePerCycle,
          type: 'SUBSCRIPTION',
          description: `${subscription.plan} Plan - Renewal`,
          subscriptionMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
          status: 'PENDING',
        }
      })

      return NextResponse.json({ subscription: updated, message: 'Subscription renewed' })
    }

    if (action === 'reset-usage') {
      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          projectsUsedThisMonth: 0,
          lastResetDate: new Date()
        }
      })
      return NextResponse.json({ subscription: updated, message: 'Usage reset' })
    }

    // General update
    const allowedFields = ['pricePerCycle', 'projectsLimit', 'notes', 'status']
    const filteredData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: filteredData
    })

    return NextResponse.json({ subscription: updated })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}

// DELETE - Delete subscription (hard delete - use with caution)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.subscription.delete({ where: { id } })

    return NextResponse.json({ message: 'Subscription deleted' })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
