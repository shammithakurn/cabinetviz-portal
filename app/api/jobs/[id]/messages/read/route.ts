// app/api/jobs/[id]/messages/read/route.ts
// Mark messages as read

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/jobs/[id]/messages/read - Mark all unread messages as read
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
      select: { userId: true },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Customers can only access their own jobs
    if (userRole === 'CUSTOMER' && job.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mark all messages from others as READ
    const result = await prisma.message.updateMany({
      where: {
        jobId,
        senderId: { not: userId },
        status: { not: 'READ' },
        // Customers shouldn't mark internal messages as read
        ...(userRole === 'CUSTOMER' && { isInternal: false }),
      },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      markedAsRead: result.count,
    })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
