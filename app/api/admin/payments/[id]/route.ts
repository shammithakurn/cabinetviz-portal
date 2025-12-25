// app/api/admin/payments/[id]/route.ts
// API routes for managing individual payments

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - Get single payment details
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

    const payment = await prisma.payment.findUnique({
      where: { id },
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
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Get related job if any
    let job = null
    if (payment.jobId) {
      job = await prisma.job.findUnique({
        where: { id: payment.jobId },
        select: { id: true, title: true, status: true, package: true }
      })
    }

    return NextResponse.json({ payment, job })
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}

// PUT - Update payment
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

    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Handle specific actions
    if (action === 'mark-paid') {
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
          processedBy: user.id,
          paymentMethod: updateData.paymentMethod || 'MANUAL'
        }
      })

      // If payment is for a job, mark job as paid
      if (payment.jobId) {
        await prisma.job.update({
          where: { id: payment.jobId },
          data: { isPaid: true, paidAt: new Date(), paymentId: payment.id }
        })
      }

      return NextResponse.json({ payment: updated, message: 'Payment marked as paid' })
    }

    if (action === 'mark-refunded') {
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          notes: `${payment.notes || ''}\nRefunded on ${new Date().toISOString()} by admin`
        }
      })

      return NextResponse.json({ payment: updated, message: 'Payment marked as refunded' })
    }

    if (action === 'send-invoice') {
      // In future, this would integrate with email service
      const updated = await prisma.payment.update({
        where: { id },
        data: {
          invoiceSentAt: new Date()
        }
      })

      return NextResponse.json({ payment: updated, message: 'Invoice sent' })
    }

    if (action === 'cancel') {
      const updated = await prisma.payment.update({
        where: { id },
        data: { status: 'CANCELLED' }
      })

      return NextResponse.json({ payment: updated, message: 'Payment cancelled' })
    }

    // General update
    const allowedFields = ['notes', 'description', 'status']
    const filteredData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field]
      }
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: filteredData
    })

    return NextResponse.json({ payment: updated })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

// DELETE - Delete payment (only if pending and no related transactions)
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

    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Only allow deletion of pending payments
    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Can only delete pending payments' }, { status: 400 })
    }

    await prisma.payment.delete({ where: { id } })

    return NextResponse.json({ message: 'Payment deleted' })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}
