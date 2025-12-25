// app/api/admin/discounts/[id]/route.ts
// API routes for managing individual discounts

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - Get single discount details
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
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'site') {
      const discount = await prisma.siteDiscount.findUnique({ where: { id } })
      if (!discount) {
        return NextResponse.json({ error: 'Site discount not found' }, { status: 404 })
      }
      return NextResponse.json({ discount, type: 'site' })
    }

    const discount = await prisma.discount.findUnique({ where: { id } })
    if (!discount) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 })
    }

    // Get usage history from payments
    const usageHistory = await prisma.payment.findMany({
      where: { discountCode: discount.code },
      select: {
        id: true,
        amount: true,
        discountAmount: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ discount, usageHistory, type: 'promo' })
  } catch (error) {
    console.error('Error fetching discount:', error)
    return NextResponse.json({ error: 'Failed to fetch discount' }, { status: 500 })
  }
}

// PUT - Update discount
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
    const { discountType, ...updateData } = body

    if (discountType === 'site') {
      const discount = await prisma.siteDiscount.findUnique({ where: { id } })
      if (!discount) {
        return NextResponse.json({ error: 'Site discount not found' }, { status: 404 })
      }

      // Process date fields - set to start/end of day (UTC)
      if (updateData.startDate) {
        const startDateTime = new Date(updateData.startDate)
        startDateTime.setUTCHours(0, 0, 0, 0)
        updateData.startDate = startDateTime
      }
      if (updateData.endDate) {
        const endDateTime = new Date(updateData.endDate)
        endDateTime.setUTCHours(23, 59, 59, 999)
        updateData.endDate = endDateTime
      }

      const updated = await prisma.siteDiscount.update({
        where: { id },
        data: updateData
      })

      return NextResponse.json({ discount: updated, type: 'site' })
    }

    const discount = await prisma.discount.findUnique({ where: { id } })
    if (!discount) {
      return NextResponse.json({ error: 'Discount not found' }, { status: 404 })
    }

    // Process date fields
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate)
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate)

    // Don't allow changing the code if it's been used
    if (updateData.code && discount.usedCount > 0 && updateData.code !== discount.code) {
      return NextResponse.json({ error: 'Cannot change code for a discount that has been used' }, { status: 400 })
    }

    const updated = await prisma.discount.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ discount: updated, type: 'promo' })
  } catch (error) {
    console.error('Error updating discount:', error)
    return NextResponse.json({ error: 'Failed to update discount' }, { status: 500 })
  }
}

// DELETE - Delete discount
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
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (type === 'site') {
      await prisma.siteDiscount.delete({ where: { id } })
      return NextResponse.json({ message: 'Site discount deleted' })
    }

    // Check if discount has been used
    const discount = await prisma.discount.findUnique({ where: { id } })
    if (discount && discount.usedCount > 0) {
      // Soft delete by deactivating instead
      await prisma.discount.update({
        where: { id },
        data: { isActive: false }
      })
      return NextResponse.json({ message: 'Discount deactivated (has usage history)' })
    }

    await prisma.discount.delete({ where: { id } })
    return NextResponse.json({ message: 'Discount deleted' })
  } catch (error) {
    console.error('Error deleting discount:', error)
    return NextResponse.json({ error: 'Failed to delete discount' }, { status: 500 })
  }
}
