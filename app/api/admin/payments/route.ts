// app/api/admin/payments/route.ts
// API routes for managing payments (Admin only)

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - List all payments
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')

    const where: Record<string, unknown> = {}
    if (status && status !== 'all') where.status = status
    if (type && type !== 'all') where.type = type
    if (userId) where.userId = userId

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // Get summary stats
    const stats = {
      totalRevenue: await prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true }
      }),
      pendingAmount: await prisma.payment.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true }
      }),
      thisMonthRevenue: await prisma.payment.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        },
        _sum: { amount: true }
      }),
      totalPayments: await prisma.payment.count(),
      pendingPayments: await prisma.payment.count({ where: { status: 'PENDING' } }),
    }

    return NextResponse.json({
      payments,
      stats: {
        totalRevenue: stats.totalRevenue._sum.amount || 0,
        pendingAmount: stats.pendingAmount._sum.amount || 0,
        thisMonthRevenue: stats.thisMonthRevenue._sum.amount || 0,
        totalPayments: stats.totalPayments,
        pendingPayments: stats.pendingPayments,
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

// POST - Create a payment (for manual invoicing)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      userId,
      amount,
      type,
      description,
      jobId,
      discountCode,
      notes
    } = body

    // Validate user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate discount if code provided
    let finalAmount = amount
    let discountAmount = 0
    let appliedDiscountCode = null

    if (discountCode) {
      const discount = await prisma.discount.findUnique({ where: { code: discountCode } })
      if (discount && discount.isActive) {
        // Check if discount is valid
        const now = new Date()
        if (discount.startDate <= now && (!discount.endDate || discount.endDate >= now)) {
          // Check max uses
          if (!discount.maxUses || discount.usedCount < discount.maxUses) {
            // Apply discount
            if (discount.type === 'PERCENTAGE') {
              discountAmount = amount * (discount.value / 100)
            } else {
              discountAmount = Math.min(discount.value, amount)
            }
            finalAmount = amount - discountAmount
            appliedDiscountCode = discountCode

            // Increment usage
            await prisma.discount.update({
              where: { id: discount.id },
              data: { usedCount: discount.usedCount + 1 }
            })
          }
        }
      }
    }

    // Generate invoice number
    const count = await prisma.payment.count()
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: finalAmount,
        originalAmount: discountAmount > 0 ? amount : null,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        discountCode: appliedDiscountCode,
        type,
        description,
        jobId,
        invoiceNumber,
        notes,
        status: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
