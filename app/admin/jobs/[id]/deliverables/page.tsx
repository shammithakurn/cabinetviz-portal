// app/admin/jobs/[id]/deliverables/page.tsx
// Admin page for uploading deliverables to a job

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

interface Props {
  params: { id: string }
}

export default async function UploadDeliverablesPage({ params }: Props) {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
    redirect('/auth/login')
  }

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { name: true, email: true },
      },
      deliverables: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!job) {
    notFound()
  }

  async function uploadDeliverable(formData: FormData) {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'DESIGNER')) {
      return
    }

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const fileUrl = formData.get('fileUrl') as string
    const fileSize = parseInt(formData.get('fileSize') as string) || 0

    if (!name || !type || !fileUrl) return

    // Check if same type exists to increment version
    const existingDeliverable = await prisma.deliverable.findFirst({
      where: { jobId: params.id, type },
      orderBy: { version: 'desc' },
    })

    const version = existingDeliverable ? existingDeliverable.version + 1 : 1

    await prisma.deliverable.create({
      data: {
        jobId: params.id,
        name,
        description,
        type,
        fileUrl,
        fileSize,
        version,
      },
    })

    // Create notification for customer
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      select: { userId: true, jobNumber: true, title: true },
    })

    if (job) {
      await prisma.notification.create({
        data: {
          userId: job.userId,
          title: 'New Deliverable Available',
          message: `A new ${type.replace(/_/g, ' ').toLowerCase()} has been uploaded for ${job.title}`,
          type: 'DELIVERABLE_READY',
          link: `/jobs/${params.id}`,
        },
      })
    }

    revalidatePath(`/admin/jobs/${params.id}/deliverables`)
    revalidatePath(`/admin/jobs/${params.id}`)
  }

  async function deleteDeliverable(formData: FormData) {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'DESIGNER')) {
      return
    }

    const deliverableId = formData.get('deliverableId') as string
    if (!deliverableId) return

    await prisma.deliverable.delete({
      where: { id: deliverableId },
    })

    revalidatePath(`/admin/jobs/${params.id}/deliverables`)
    revalidatePath(`/admin/jobs/${params.id}`)
  }

  const deliverableTypes = [
    { value: 'RENDER_FRONT', label: 'Front View Render', category: '3D Renders' },
    { value: 'RENDER_PERSPECTIVE', label: 'Perspective Render', category: '3D Renders' },
    { value: 'RENDER_TOP', label: 'Top View Render', category: '3D Renders' },
    { value: 'RENDER_DETAIL', label: 'Detail Render', category: '3D Renders' },
    { value: 'DRAWING_ELEVATION', label: 'Elevation Drawing', category: '2D Drawings' },
    { value: 'DRAWING_PLAN', label: 'Floor Plan', category: '2D Drawings' },
    { value: 'DRAWING_SECTION', label: 'Section Drawing', category: '2D Drawings' },
    { value: 'CUT_LIST', label: 'Cut List', category: 'Technical' },
    { value: 'ASSEMBLY_GUIDE', label: 'Assembly Guide', category: 'Technical' },
    { value: 'MATERIAL_LIST', label: 'Material List', category: 'Technical' },
  ]

  // Group deliverable types by category
  const groupedTypes = deliverableTypes.reduce((acc, type) => {
    if (!acc[type.category]) acc[type.category] = []
    acc[type.category].push(type)
    return acc
  }, {} as Record<string, typeof deliverableTypes>)

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-light">
          <Link href="/admin" className="hover:text-walnut">Dashboard</Link>
          <span>→</span>
          <Link href="/admin/jobs" className="hover:text-walnut">Jobs</Link>
          <span>→</span>
          <Link href={`/admin/jobs/${job.id}`} className="hover:text-walnut">{job.jobNumber}</Link>
          <span>→</span>
          <span className="text-text font-medium">Upload Deliverables</span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Upload Deliverables</h1>
          <p className="text-text-light mt-1">
            {job.title} • {job.jobNumber} • {job.user.name}
          </p>
        </div>
        <Link
          href={`/admin/jobs/${job.id}`}
          className="px-4 py-2 text-text-light hover:text-text border border-border rounded-lg hover:bg-dark-elevated transition-colors"
        >
          ← Back to Job
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-gradient-to-r from-walnut to-accent">
            <h2 className="font-bold text-white flex items-center gap-2">
              <span>📤</span> Upload New Deliverable
            </h2>
          </div>
          <form action={uploadDeliverable} className="p-5 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                File Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g., Kitchen Front View Render"
                className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                Deliverable Type <span className="text-red-400">*</span>
              </label>
              <select
                name="type"
                required
                className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
              >
                <option value="">Select type...</option>
                {Object.entries(groupedTypes).map(([category, types]) => (
                  <optgroup key={category} label={category}>
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Description</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Optional description or notes about this deliverable"
                className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut resize-none"
              />
            </div>

            {/* File URL - In a real app this would be a file upload */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                File URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="fileUrl"
                required
                placeholder="https://storage.example.com/file.pdf"
                className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
              />
              <p className="text-xs text-text-muted mt-1">
                Enter the URL where the file is hosted (e.g., cloud storage link)
              </p>
            </div>

            {/* File Size */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">File Size (bytes)</label>
              <input
                type="number"
                name="fileSize"
                placeholder="e.g., 2048000"
                min="0"
                className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-walnut to-accent text-white font-bold rounded-lg hover:from-walnut-dark hover:to-walnut transition-all shadow-lg"
            >
              Upload Deliverable
            </button>
          </form>
        </div>

        {/* Existing Deliverables */}
        <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border bg-dark-elevated">
            <h2 className="font-bold text-text flex items-center gap-2">
              <span>📁</span> Existing Deliverables ({job.deliverables.length})
            </h2>
          </div>
          <div className="p-5">
            {job.deliverables.length > 0 ? (
              <div className="space-y-3">
                {job.deliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="flex items-center gap-3 p-4 bg-dark-elevated rounded-lg"
                  >
                    <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center text-2xl">
                      {getDeliverableIcon(deliverable.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text">{deliverable.name}</p>
                      <p className="text-sm text-text-light">
                        {deliverable.type.replace(/_/g, ' ')} • Version {deliverable.version}
                      </p>
                      {deliverable.description && (
                        <p className="text-sm text-text-muted mt-1">{deliverable.description}</p>
                      )}
                      <p className="text-xs text-text-muted mt-1">
                        Uploaded {new Date(deliverable.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={deliverable.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-walnut hover:bg-walnut/20 rounded-lg transition-colors"
                        title="Download"
                      >
                        ⬇️
                      </a>
                      <form action={deleteDeliverable}>
                        <input type="hidden" name="deliverableId" value={deliverable.id} />
                        <button
                          type="submit"
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this deliverable?')) {
                              e.preventDefault()
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-text-light">No deliverables uploaded yet</p>
                <p className="text-sm text-text-muted mt-1">
                  Upload renders, drawings, and documents for the customer
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="mt-8 bg-walnut/10 rounded-xl p-6 border border-walnut/30">
        <h3 className="font-bold text-walnut mb-4">📋 Deliverable Types Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-text mb-2">3D Renders</h4>
            <ul className="text-sm text-text-light space-y-1">
              <li>• Front View - Main cabinet face</li>
              <li>• Perspective - 3D angle view</li>
              <li>• Top View - Bird&apos;s eye view</li>
              <li>• Detail - Close-up renders</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-2">2D Drawings</h4>
            <ul className="text-sm text-text-light space-y-1">
              <li>• Elevation - Wall view drawings</li>
              <li>• Floor Plan - Top-down layout</li>
              <li>• Section - Cross-section views</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-2">Technical Documents</h4>
            <ul className="text-sm text-text-light space-y-1">
              <li>• Cut List - Panel cutting specs</li>
              <li>• Assembly Guide - Build instructions</li>
              <li>• Material List - Required materials</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function getDeliverableIcon(type: string): string {
  if (type.startsWith('RENDER_')) return '🖼️'
  if (type.startsWith('DRAWING_')) return '📐'
  if (type === 'CUT_LIST') return '✂️'
  if (type === 'ASSEMBLY_GUIDE') return '🔧'
  if (type === 'MATERIAL_LIST') return '📋'
  return '📄'
}
