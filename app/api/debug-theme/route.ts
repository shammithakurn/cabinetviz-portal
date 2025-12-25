// Temporary debug endpoint - DELETE AFTER DEBUGGING
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get image-related settings from database
    const imageSettings = await prisma.themeSetting.findMany({
      where: {
        OR: [
          { key: { contains: 'image' } },
          { key: { contains: 'logo' } },
          { key: { contains: 'hero' } }
        ]
      },
      select: {
        key: true,
        value: true,
        category: true
      }
    })

    return NextResponse.json({
      settings: imageSettings,
      count: imageSettings.length
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
