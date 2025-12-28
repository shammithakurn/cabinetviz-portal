// app/api/jobs/route.ts
// API routes for job management

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { createJobSchema } from '@/lib/validations'
import { generateJobNumber } from '@/lib/utils'

// GET /api/jobs - List all jobs for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { userId: user.id }
    if (status) {
      where.status = status
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          _count: {
            select: { files: true, deliverables: true, messages: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json({ jobs, total, limit, offset })
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validationResult = createJobSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check subscription if user has one
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id }
    })

    let usesSubscription = false

    if (subscription && subscription.status === 'ACTIVE') {
      // Check if user has remaining projects in their subscription
      if (subscription.projectsUsedThisMonth >= subscription.projectsLimit) {
        // Subscription limit reached, will charge per-project
        usesSubscription = false
      } else {
        // Use subscription project
        usesSubscription = true
      }
    }

    // Generate unique job number
    let jobNumber = generateJobNumber()
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.job.findUnique({ where: { jobNumber } })
      if (!existing) break
      jobNumber = generateJobNumber()
      attempts++
    }

    // Determine package type and pricing
    const packagePricing: Record<string, number> = {
      'BASIC': 99,
      'PROFESSIONAL': 199,
      'PREMIUM': 299,
    }
    const packageType = data.package || 'BASIC'
    const basePrice = usesSubscription ? 0 : (packagePricing[packageType] || 99)

    // Create the job
    const job = await prisma.job.create({
      data: {
        jobNumber,
        title: data.title,
        description: data.description || null,
        projectType: data.projectType,
        roomType: data.roomType || null,
        priority: data.priority,
        package: packageType,
        roomWidth: data.roomWidth || null,
        roomLength: data.roomLength || null,
        roomHeight: data.roomHeight || null,
        dimensionUnit: data.dimensionUnit,
        cabinetStyle: data.cabinetStyle || null,
        materialType: data.materialType || null,
        colorScheme: data.colorScheme || null,
        handleStyle: data.handleStyle || null,
        budget: data.budget || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        notes: data.notes || null,
        userId: user.id,
        // Set quoted price based on subscription or pay-per-project
        quotedPrice: basePrice > 0 ? basePrice : null,
        statusHistory: {
          create: {
            toStatus: 'PENDING',
            changedBy: user.name,
            note: usesSubscription
              ? 'Job created (Partner subscription)'
              : 'Job created (Pay-per-project)',
          },
        },
      },
    })

    // If using subscription, increment the usage counter
    if (usesSubscription && subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          projectsUsedThisMonth: subscription.projectsUsedThisMonth + 1
        }
      })
    }

    // Create notification for admin (in production, you'd notify admin users)
    // For now, we'll skip this

    return NextResponse.json({
      job,
      usesSubscription,
      message: usesSubscription
        ? `Project created using your Partner subscription (${subscription!.projectsUsedThisMonth + 1}/${subscription!.projectsLimit} used this month)`
        : 'Project created with pay-per-project pricing'
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
