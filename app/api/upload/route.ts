// app/api/upload/route.ts
// API route for file uploads using Vercel Blob

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, formatFileSize } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const jobId = formData.get('jobId') as string
    const category = formData.get('category') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: { id: jobId, userId: user.id },
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

    // Generate unique filename (matching admin images route format)
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '')
    const filename = `job-${jobId}-${safeName}-${timestamp}.${ext}`

    // Upload to Vercel Blob (using same format as admin images)
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    // Save file record to database
    const fileRecord = await prisma.jobFile.create({
      data: {
        filename: blob.pathname,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: blob.url,
        category: category || 'OTHER',
        jobId,
      },
    })

    return NextResponse.json({ file: fileRecord }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)

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
      { error: `Failed to upload file: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// GET /api/upload?jobId=xxx - List files for a job
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Verify job belongs to user
    const job = await prisma.job.findFirst({
      where: { id: jobId, userId: user.id },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const files = await prisma.jobFile.findMany({
      where: { jobId },
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Failed to fetch files:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
