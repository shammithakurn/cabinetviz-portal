// app/api/admin/images/route.ts
// API route for theme image uploads using Vercel Blob

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { put, del, list } from '@vercel/blob'
import { getCurrentUser } from '@/lib/auth'

// GET - List all uploaded theme images
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // List all blobs in the theme folder
    const { blobs } = await list({ prefix: 'theme/' })
    const images = blobs.map(blob => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt
    }))

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Failed to list images:', error)
    // Return empty array if blob storage not configured
    return NextResponse.json({ images: [] })
  }
}

// POST - Upload a new theme image
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, GIF, WebP, SVG' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^.]+$/, '')
    const filename = `theme/${category}-${safeName}-${timestamp}.${ext}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Failed to upload image:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Check for specific error types
    if (errorMessage.includes('BLOB_READ_WRITE_TOKEN') || errorMessage.includes('token')) {
      return NextResponse.json({
        error: 'Blob storage not configured. Please add BLOB_READ_WRITE_TOKEN to environment variables.'
      }, { status: 500 })
    }

    if (errorMessage.includes('Forbidden') || errorMessage.includes('403')) {
      return NextResponse.json({
        error: 'Blob storage access denied. Please check your BLOB_READ_WRITE_TOKEN is valid and linked to your Blob store.'
      }, { status: 403 })
    }

    return NextResponse.json({ error: `Failed to upload image: ${errorMessage}` }, { status: 500 })
  }
}

// DELETE - Delete a theme image
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // Delete from Vercel Blob
    await del(url)

    return NextResponse.json({ success: true, message: 'Image deleted' })
  } catch (error) {
    console.error('Failed to delete image:', error)
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
  }
}
