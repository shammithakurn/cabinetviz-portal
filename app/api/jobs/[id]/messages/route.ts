// app/api/jobs/[id]/messages/route.ts
// API routes for job-specific messages

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/jobs/[id]/messages - Fetch all messages for a job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params
    const userId = user.id
    const userRole = user.role

    // Verify user has access to this job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { userId: true },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Customers can only view their own jobs
    if (userRole === 'CUSTOMER' && job.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch messages with sender info
    const messages = await prisma.message.findMany({
      where: {
        jobId,
        // Customers cannot see internal messages
        ...(userRole === 'CUSTOMER' && { isInternal: false }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Count unread messages for recipient
    const unreadCount = await prisma.message.count({
      where: {
        jobId,
        senderId: { not: userId },
        status: { not: 'READ' },
        ...(userRole === 'CUSTOMER' && { isInternal: false }),
      },
    })

    return NextResponse.json({
      messages,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/jobs/[id]/messages - Create a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: jobId } = await params
    const userId = user.id
    const userRole = user.role

    // Verify user has access to this job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Customers can only message on their own jobs
    if (userRole === 'CUSTOMER' && job.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { content, isInternal = false } = body

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Customers cannot send internal messages
    const messageIsInternal = userRole === 'CUSTOMER' ? false : isInternal

    // Create the message with DELIVERED status (since server received it)
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        jobId,
        senderId: userId,
        status: 'DELIVERED',
        isInternal: messageIsInternal,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    // Create notification for recipient(s)
    // If customer sent message, notify admins
    // If admin/designer sent message, notify customer
    if (userRole === 'CUSTOMER') {
      // Find all admins and designers
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'DESIGNER'] } },
        select: { id: true },
      })

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map((admin: { id: string }) => ({
            userId: admin.id,
            title: 'New Message',
            message: `${user.name || 'Customer'} sent a message on ${job.title}`,
            type: 'NEW_COMMENT',
            link: `/admin/jobs/${jobId}`,
          })),
        })
      }
    } else if (!messageIsInternal) {
      // Notify the job owner (customer)
      await prisma.notification.create({
        data: {
          userId: job.userId,
          title: 'New Message',
          message: `${user.name || 'Staff'} replied on ${job.title}`,
          type: 'NEW_COMMENT',
          link: `/jobs/${jobId}`,
        },
      })
    }

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
