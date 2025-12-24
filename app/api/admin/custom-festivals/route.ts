// app/api/admin/custom-festivals/route.ts
// API endpoint for custom festival management

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET - Fetch all custom festivals
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customFestivals = await prisma.customFestival.findMany({
      orderBy: { startDate: 'asc' },
    })

    // Parse JSON fields
    const parsed = customFestivals.map(f => ({
      ...f,
      colors: JSON.parse(f.colors),
      countries: f.countries.split(',').map(c => c.trim()),
      customAnimation: f.customAnimation ? JSON.parse(f.customAnimation) : null,
    }))

    return NextResponse.json({
      success: true,
      festivals: parsed,
    })
  } catch (error) {
    console.error('Custom festival fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom festivals' },
      { status: 500 }
    )
  }
}

// POST - Create a new custom festival
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      displayName,
      startDate,
      endDate,
      duration,
      isRecurring,
      colors,
      animation,
      intensity,
      customAnimation,
      greeting,
      icon,
      bannerText,
      countries,
      priority,
    } = body

    // Validate required fields
    if (!name || !displayName || !startDate || !greeting || !icon) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const festival = await prisma.customFestival.create({
      data: {
        name: name.toLowerCase().replace(/\s+/g, '-'),
        displayName,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(new Date(startDate).getTime() + (duration || 1) * 24 * 60 * 60 * 1000),
        duration: duration || 1,
        isRecurring: isRecurring || false,
        colors: JSON.stringify(colors || { primary: '#FF6B6B', secondary: '#4ECDC4', accent: '#FFE66D' }),
        animation: animation || 'confetti',
        intensity: intensity || 'medium',
        customAnimation: customAnimation ? JSON.stringify(customAnimation) : null,
        greeting,
        icon,
        bannerText,
        countries: Array.isArray(countries) ? countries.join(',') : countries || 'GLOBAL',
        priority: priority || 50,
        createdBy: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      festival: {
        ...festival,
        colors: JSON.parse(festival.colors),
        countries: festival.countries.split(','),
        customAnimation: festival.customAnimation ? JSON.parse(festival.customAnimation) : null,
      },
    })
  } catch (error) {
    console.error('Custom festival create error:', error)
    return NextResponse.json(
      { error: 'Failed to create custom festival' },
      { status: 500 }
    )
  }
}

// PUT - Update a custom festival
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Festival ID required' }, { status: 400 })
    }

    // Prepare update data
    const data: Record<string, unknown> = {}
    if (updateData.name) data.name = updateData.name.toLowerCase().replace(/\s+/g, '-')
    if (updateData.displayName) data.displayName = updateData.displayName
    if (updateData.startDate) data.startDate = new Date(updateData.startDate)
    if (updateData.endDate) data.endDate = new Date(updateData.endDate)
    if (updateData.duration) data.duration = updateData.duration
    if (typeof updateData.isRecurring === 'boolean') data.isRecurring = updateData.isRecurring
    if (updateData.colors) data.colors = JSON.stringify(updateData.colors)
    if (updateData.animation) data.animation = updateData.animation
    if (updateData.intensity) data.intensity = updateData.intensity
    if (updateData.customAnimation) data.customAnimation = JSON.stringify(updateData.customAnimation)
    if (updateData.greeting) data.greeting = updateData.greeting
    if (updateData.icon) data.icon = updateData.icon
    if (updateData.bannerText !== undefined) data.bannerText = updateData.bannerText
    if (updateData.countries) data.countries = Array.isArray(updateData.countries) ? updateData.countries.join(',') : updateData.countries
    if (updateData.priority) data.priority = updateData.priority
    if (typeof updateData.isActive === 'boolean') data.isActive = updateData.isActive

    const festival = await prisma.customFestival.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      success: true,
      festival: {
        ...festival,
        colors: JSON.parse(festival.colors),
        countries: festival.countries.split(','),
        customAnimation: festival.customAnimation ? JSON.parse(festival.customAnimation) : null,
      },
    })
  } catch (error) {
    console.error('Custom festival update error:', error)
    return NextResponse.json(
      { error: 'Failed to update custom festival' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a custom festival
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Festival ID required' }, { status: 400 })
    }

    await prisma.customFestival.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Custom festival delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete custom festival' },
      { status: 500 }
    )
  }
}
