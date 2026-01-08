// app/api/admin/update-pricing/route.ts
// One-time script to update pricing_packages in database

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

const NEW_PRICING_PACKAGES = JSON.stringify([
  { name: 'Kitchen Basic', subtitle: '1 Kitchen visualization', price: '$79', period: '', featured: false, features: ['1 Kitchen visualization', '2D Elevation views', '2D Top view', '3D View', '1 revision round', '5 business day delivery'] },
  { name: 'Kitchen Professional', subtitle: 'Best value for contractors', price: '$199', period: '', featured: true, features: ['4 Kitchen visualizations', '2D Elevation views', '2D Top view', '3D View', '2 revision rounds', 'Priority support', '3 business day delivery'] },
  { name: 'Kitchen Premium', subtitle: 'For builders & designers', price: '$499', period: '', featured: false, features: ['10 Kitchen visualizations', '2D Elevation views', '2D Top view', '3D View', 'Unlimited revisions', 'Priority delivery', 'Dedicated project manager', '2 business day delivery'] }
])

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update pricing_packages directly
    const result = await prisma.themeSetting.upsert({
      where: { key: 'pricing_packages' },
      update: {
        value: NEW_PRICING_PACKAGES,
        updatedBy: user.id
      },
      create: {
        key: 'pricing_packages',
        value: NEW_PRICING_PACKAGES,
        category: 'PRICING',
        label: 'Pricing Packages',
        type: 'JSON',
        description: 'Pricing cards configuration',
        updatedBy: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Pricing packages updated!',
      data: result
    })
  } catch (error) {
    console.error('Error updating pricing:', error)
    return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 })
  }
}

// GET to check current value
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const setting = await prisma.themeSetting.findUnique({
      where: { key: 'pricing_packages' }
    })

    return NextResponse.json({
      current: setting?.value ? JSON.parse(setting.value) : null,
      raw: setting?.value
    })
  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 })
  }
}
