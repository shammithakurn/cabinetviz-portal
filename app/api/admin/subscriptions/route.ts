// app/api/admin/subscriptions/route.ts
// API routes for managing subscriptions (Admin only)

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - List all subscriptions with user details
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get summary stats
    const stats = {
      total: await prisma.subscription.count(),
      active: await prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      paused: await prisma.subscription.count({ where: { status: 'PAUSED' } }),
      cancelled: await prisma.subscription.count({ where: { status: 'CANCELLED' } }),
      monthlyRevenue: await prisma.subscription.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { pricePerCycle: true }
      })
    }

    return NextResponse.json({
      subscriptions,
      stats: {
        ...stats,
        monthlyRevenue: stats.monthlyRevenue._sum.pricePerCycle || 0
      }
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

// POST - Create a new subscription for a user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      userId,
      plan = 'PARTNER',
      billingCycle = 'MONTHLY',
      pricePerCycle = 499,
      projectsLimit = 5,
      notes
    } = body

    // Check if user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId }
    })
    if (existingSubscription) {
      return NextResponse.json({
        error: 'User already has a subscription. Please update or cancel the existing one.'
      }, { status: 400 })
    }

    // Calculate period end date
    const now = new Date()
    const periodEnd = new Date(now)
    if (billingCycle === 'YEARLY') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'ACTIVE',
        billingCycle,
        pricePerCycle,
        projectsLimit,
        startDate: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        lastResetDate: now,
        notes
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Create initial payment record
    await prisma.payment.create({
      data: {
        userId,
        amount: pricePerCycle,
        type: 'SUBSCRIPTION',
        description: `${plan} Plan - ${billingCycle} subscription`,
        subscriptionMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        status: 'PENDING',
      }
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}
