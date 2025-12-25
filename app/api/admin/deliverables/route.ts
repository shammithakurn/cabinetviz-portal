// app/api/admin/deliverables/route.ts
// API route for uploading deliverables using Vercel Blob

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, formatFileSize } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const jobId = formData.get('jobId') as string
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 })
    }

    if (!type) {
      return NextResponse.json({ error: 'Deliverable type required' }, { status: 400 })
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, userId: true, jobNumber: true, title: true },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Validate file size (Vercel serverless limit - see lib/constants.ts to update)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({
        error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${formatFileSize(file.size)}.`
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '')
    const filename = `deliverables/${jobId}/${type.toLowerCase()}-${safeName}-${timestamp}.${ext}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    // Check if same type exists to increment version
    const existingDeliverable = await prisma.deliverable.findFirst({
      where: { jobId, type },
      orderBy: { version: 'desc' },
    })

    const version = existingDeliverable ? existingDeliverable.version + 1 : 1

    // Save deliverable record to database
    const deliverable = await prisma.deliverable.create({
      data: {
        jobId,
        name,
        description: description || null,
        type,
        fileUrl: blob.url,
        fileSize: file.size,
        version,
      },
    })

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: job.userId,
        title: 'New Deliverable Available',
        message: `A new ${type.replace(/_/g, ' ').toLowerCase()} has been uploaded for ${job.title}`,
        type: 'DELIVERABLE_READY',
        link: `/jobs/${jobId}`,
      },
    })

    return NextResponse.json({ deliverable }, { status: 201 })
  } catch (error) {
    console.error('Deliverable upload error:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Check for specific error types
    if (errorMessage.includes('BLOB_READ_WRITE_TOKEN') || errorMessage.includes('token')) {
      return NextResponse.json({
        error: 'Blob storage not configured. Please add BLOB_READ_WRITE_TOKEN to environment variables.'
      }, { status: 500 })
    }

    if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
      return NextResponse.json({
        error: 'Blob storage access denied. Please check your BLOB_READ_WRITE_TOKEN permissions.'
      }, { status: 403 })
    }

    return NextResponse.json(
      { error: `Failed to upload deliverable: ${errorMessage}` },
      { status: 500 }
    )
  }
}
