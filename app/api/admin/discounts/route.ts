// app/api/admin/discounts/route.ts
// API routes for managing discounts (Admin only)

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET - List all discounts
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'promo' or 'site'
    const active = searchParams.get('active')

    if (type === 'site') {
      // Get site-wide discounts
      const where: Record<string, unknown> = {}
      if (active === 'true') where.isActive = true
      if (active === 'false') where.isActive = false

      const siteDiscounts = await prisma.siteDiscount.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({ discounts: siteDiscounts, type: 'site' })
    }

    // Get promo code discounts
    const where: Record<string, unknown> = {}
    if (active === 'true') where.isActive = true
    if (active === 'false') where.isActive = false

    const discounts = await prisma.discount.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Get usage stats
    const stats = {
      totalDiscounts: discounts.length,
      activeDiscounts: discounts.filter(d => d.isActive).length,
      totalUsage: discounts.reduce((sum, d) => sum + d.usedCount, 0),
    }

    return NextResponse.json({ discounts, stats, type: 'promo' })
  } catch (error) {
    console.error('Error fetching discounts:', error)
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 })
  }
}

// POST - Create a discount
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { discountType } = body // 'promo' or 'site'

    if (discountType === 'site') {
      // Create site-wide discount
      const {
        name,
        type,
        value,
        bannerText,
        bannerColor,
        appliesTo,
        startDate,
        endDate,
        isActive
      } = body

      // Set start date to beginning of day and end date to end of day (UTC)
      const startDateTime = new Date(startDate)
      startDateTime.setUTCHours(0, 0, 0, 0)

      const endDateTime = new Date(endDate)
      endDateTime.setUTCHours(23, 59, 59, 999)

      const siteDiscount = await prisma.siteDiscount.create({
        data: {
          name,
          type,
          value,
          bannerText,
          bannerColor: bannerColor || '#EF4444',
          appliesTo: appliesTo || 'ALL',
          startDate: startDateTime,
          endDate: endDateTime,
          isActive: isActive ?? false,
          createdBy: user.id
        }
      })

      return NextResponse.json({ discount: siteDiscount, type: 'site' })
    }

    // Create promo code discount
    const {
      code,
      name,
      description,
      type,
      value,
      scope,
      applicablePlans,
      userId,
      maxUses,
      maxUsesPerUser,
      minOrderValue,
      startDate,
      endDate,
      isActive
    } = body

    // Check if code already exists
    const existingDiscount = await prisma.discount.findUnique({ where: { code } })
    if (existingDiscount) {
      return NextResponse.json({ error: 'Discount code already exists' }, { status: 400 })
    }

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        type,
        value,
        scope: scope || 'ALL',
        applicablePlans,
        userId, // For customer-specific discounts
        maxUses,
        maxUsesPerUser: maxUsesPerUser || 1,
        minOrderValue,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
        createdBy: user.id
      }
    })

    return NextResponse.json({ discount, type: 'promo' })
  } catch (error) {
    console.error('Error creating discount:', error)
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 })
  }
}
