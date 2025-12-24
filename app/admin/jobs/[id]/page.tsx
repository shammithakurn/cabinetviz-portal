// app/admin/jobs/[id]/page.tsx
// Admin job detail and management page

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

interface Props {
  params: { id: string }
}

export default async function AdminJobDetailPage({ params }: Props) {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
    redirect('/auth/login')
  }

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, company: true, phone: true },
      },
      files: {
        orderBy: { uploadedAt: 'desc' },
      },
      comments: {
        orderBy: { createdAt: 'desc' },
      },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
      },
      deliverables: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!job) {
    notFound()
  }

  // Server actions for form submissions
  async function updateJobStatus(formData: FormData) {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'DESIGNER')) {
      return
    }

    const newStatus = formData.get('status') as string
    const progress = parseInt(formData.get('progress') as string) || 0
    const quotedPrice = formData.get('quotedPrice') ? parseFloat(formData.get('quotedPrice') as string) : null
    const priority = formData.get('priority') as string

    const currentJob = await prisma.job.findUnique({ where: { id: params.id } })
    if (!currentJob) return

    // Update job
    await prisma.job.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        progress,
        quotedPrice,
        priority,
      },
    })

    // Add status history if status changed
    if (currentJob.status !== newStatus) {
      await prisma.statusHistory.create({
        data: {
          jobId: params.id,
          fromStatus: currentJob.status,
          toStatus: newStatus,
          changedBy: currentUser.name,
        },
      })
    }

    revalidatePath(`/admin/jobs/${params.id}`)
  }

  async function addComment(formData: FormData) {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'DESIGNER')) {
      return
    }

    const content = formData.get('content') as string
    const isInternal = formData.get('isInternal') === 'on'

    if (!content.trim()) return

    await prisma.comment.create({
      data: {
        jobId: params.id,
        content: content.trim(),
        authorName: currentUser.name,
        authorRole: currentUser.role,
        isInternal,
      },
    })

    revalidatePath(`/admin/jobs/${params.id}`)
  }

  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: 'amber' },
    { value: 'QUOTED', label: 'Quoted', color: 'blue' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'purple' },
    { value: 'REVIEW', label: 'Ready for Review', color: 'orange' },
    { value: 'REVISION', label: 'Revision Requested', color: 'pink' },
    { value: 'COMPLETED', label: 'Completed', color: 'green' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'gray' },
  ]

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'NORMAL', label: 'Normal' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
  ]

  const projectTypeLabels: Record<string, string> = {
    KITCHEN: 'Kitchen',
    WARDROBE: 'Wardrobe',
    BATHROOM_VANITY: 'Bathroom Vanity',
    ENTERTAINMENT_UNIT: 'Entertainment Unit',
    HOME_OFFICE: 'Home Office',
    LAUNDRY: 'Laundry',
    CUSTOM: 'Custom',
  }

  const roomTypeLabels: Record<string, string> = {
    L_SHAPED: 'L-Shaped',
    U_SHAPED: 'U-Shaped',
    GALLEY: 'Galley',
    SINGLE_WALL: 'Single Wall',
    ISLAND: 'Island',
    WALK_IN: 'Walk-In',
    REACH_IN: 'Reach-In',
    CUSTOM: 'Custom',
  }

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-light">
          <Link href="/admin" className="hover:text-walnut">Dashboard</Link>
          <span>→</span>
          <Link href="/admin/jobs" className="hover:text-walnut">Jobs</Link>
          <span>→</span>
          <span className="text-text font-medium">{job.jobNumber}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-text">{job.title}</h1>
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
          <p className="text-text-light">{job.jobNumber} • Created {new Date(job.createdAt).toLocaleDateString()}</p>
        </div>
        <Link
          href="/admin/jobs"
          className="px-4 py-2 text-text-light hover:text-text border border-border rounded-lg hover:bg-dark-elevated transition-colors"
        >
          ← Back to Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>👤</span> Customer Information
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-light">Name</p>
                  <p className="font-medium text-text">{job.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-light">Company</p>
                  <p className="font-medium text-text">{job.user.company || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-light">Email</p>
                  <a href={`mailto:${job.user.email}`} className="font-medium text-walnut hover:text-accent">
                    {job.user.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-text-light">Phone</p>
                  <p className="font-medium text-text">{job.user.phone || '—'}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <Link
                  href={`/admin/customers/${job.user.id}`}
                  className="text-walnut hover:text-accent text-sm font-medium"
                >
                  View Customer Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📋</span> Project Details
              </h2>
            </div>
            <div className="p-5">
              {job.description && (
                <div className="mb-6">
                  <p className="text-sm text-text-light mb-1">Description</p>
                  <p className="text-text">{job.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-text-light">Project Type</p>
                  <p className="font-medium text-text">{projectTypeLabels[job.projectType] || job.projectType}</p>
                </div>
                {job.roomType && (
                  <div>
                    <p className="text-sm text-text-light">Room Type</p>
                    <p className="font-medium text-text">{roomTypeLabels[job.roomType] || job.roomType}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-text-light">Package</p>
                  <p className="font-medium text-text">{job.package}</p>
                </div>
              </div>

              {/* Dimensions */}
              {(job.roomWidth || job.roomLength || job.roomHeight) && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-text-light mb-3">Dimensions ({job.dimensionUnit})</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-dark-elevated rounded-lg p-3 text-center">
                      <p className="text-xs text-text-light">Width</p>
                      <p className="font-bold text-text">{job.roomWidth || '—'}</p>
                    </div>
                    <div className="bg-dark-elevated rounded-lg p-3 text-center">
                      <p className="text-xs text-text-light">Length</p>
                      <p className="font-bold text-text">{job.roomLength || '—'}</p>
                    </div>
                    <div className="bg-dark-elevated rounded-lg p-3 text-center">
                      <p className="text-xs text-text-light">Height</p>
                      <p className="font-bold text-text">{job.roomHeight || '—'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Style Preferences */}
              {(job.cabinetStyle || job.materialType || job.colorScheme || job.handleStyle) && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-text-light mb-3">Style Preferences</p>
                  <div className="grid grid-cols-2 gap-4">
                    {job.cabinetStyle && (
                      <div>
                        <p className="text-xs text-text-light">Cabinet Style</p>
                        <p className="font-medium text-text">{job.cabinetStyle}</p>
                      </div>
                    )}
                    {job.materialType && (
                      <div>
                        <p className="text-xs text-text-light">Material</p>
                        <p className="font-medium text-text">{job.materialType}</p>
                      </div>
                    )}
                    {job.colorScheme && (
                      <div>
                        <p className="text-xs text-text-light">Color Scheme</p>
                        <p className="font-medium text-text">{job.colorScheme}</p>
                      </div>
                    )}
                    {job.handleStyle && (
                      <div>
                        <p className="text-xs text-text-light">Handle Style</p>
                        <p className="font-medium text-text">{job.handleStyle}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Budget & Deadline */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-light">Customer Budget</p>
                    <p className="font-bold text-text">
                      {job.budget ? `$${job.budget.toLocaleString()}` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Deadline</p>
                    <p className="font-medium text-text">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {job.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-text-light mb-1">Additional Notes</p>
                  <p className="text-text bg-dark-elevated rounded-lg p-3">{job.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded Files */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📎</span> Customer Files ({job.files.length})
              </h2>
            </div>
            <div className="p-5">
              {job.files.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-dark-elevated rounded-lg">
                      <div className="w-10 h-10 bg-walnut/20 rounded-lg flex items-center justify-center text-lg">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text truncate">{file.originalName}</p>
                        <p className="text-xs text-text-light">
                          {file.category} • {formatFileSize(file.size)}
                        </p>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-walnut hover:bg-walnut/20 rounded-lg transition-colors"
                        title="Download"
                      >
                        ⬇️
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-light text-center py-8">No files uploaded by customer</p>
              )}
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated flex items-center justify-between">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📤</span> Deliverables ({job.deliverables.length})
              </h2>
              <Link
                href={`/admin/jobs/${job.id}/deliverables`}
                className="px-3 py-1.5 bg-walnut text-white text-sm font-medium rounded-lg hover:bg-walnut-dark transition-colors"
              >
                + Upload
              </Link>
            </div>
            <div className="p-5">
              {job.deliverables.length > 0 ? (
                <div className="space-y-3">
                  {job.deliverables.map((deliverable) => (
                    <div key={deliverable.id} className="flex items-center gap-3 p-3 bg-dark-elevated rounded-lg">
                      <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center text-lg">
                        📁
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text">{deliverable.name}</p>
                        <p className="text-xs text-text-light">
                          {deliverable.type} • v{deliverable.version} • {formatFileSize(deliverable.fileSize)}
                        </p>
                      </div>
                      <a
                        href={deliverable.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-400 hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Download"
                      >
                        ⬇️
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-light text-center py-8">No deliverables uploaded yet</p>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>💬</span> Comments & Notes
              </h2>
            </div>
            <div className="p-5">
              {/* Add Comment Form */}
              <form action={addComment} className="mb-6">
                <textarea
                  name="content"
                  rows={3}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut resize-none"
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-sm text-text-light">
                    <input type="checkbox" name="isInternal" className="rounded border-border bg-dark-elevated" />
                    Internal note (not visible to customer)
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-walnut text-white font-medium rounded-lg hover:bg-walnut-dark transition-colors"
                  >
                    Add Comment
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {job.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${
                      comment.isInternal
                        ? 'bg-yellow-900/20 border border-yellow-700/30'
                        : comment.authorRole === 'CUSTOMER'
                        ? 'bg-dark-elevated'
                        : 'bg-walnut/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-text">{comment.authorName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        comment.authorRole === 'CUSTOMER'
                          ? 'bg-gray-700/50 text-gray-300'
                          : comment.authorRole === 'ADMIN'
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-purple-900/30 text-purple-400'
                      }`}>
                        {comment.authorRole}
                      </span>
                      {comment.isInternal && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-900/30 text-yellow-400">
                          🔒 Internal
                        </span>
                      )}
                      <span className="text-xs text-text-muted ml-auto">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-text-light">{comment.content}</p>
                  </div>
                ))}
                {job.comments.length === 0 && (
                  <p className="text-text-light text-center py-4">No comments yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Right column */}
        <div className="space-y-6">
          {/* Job Management Form */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden sticky top-8">
            <div className="p-5 border-b border-border bg-gradient-to-r from-walnut to-accent">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span>⚙️</span> Manage Job
              </h2>
            </div>
            <form action={updateJobStatus} className="p-5 space-y-5">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">Status</label>
                <select
                  name="status"
                  defaultValue={job.status}
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">Priority</label>
                <select
                  name="priority"
                  defaultValue={job.priority}
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">
                  Progress: <span className="text-walnut">{job.progress}%</span>
                </label>
                <input
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  step="5"
                  defaultValue={job.progress}
                  className="w-full h-2 bg-dark-elevated rounded-lg appearance-none cursor-pointer accent-walnut"
                />
                <div className="flex justify-between text-xs text-text-muted mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Quoted Price */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">Quoted Price ($)</label>
                <input
                  type="number"
                  name="quotedPrice"
                  defaultValue={job.quotedPrice || ''}
                  placeholder="Enter quote amount"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-walnut to-accent text-white font-bold rounded-lg hover:from-walnut-dark hover:to-walnut transition-all shadow-lg"
              >
                Update Job
              </button>
            </form>
          </div>

          {/* Status History */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📜</span> Status History
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {job.statusHistory.map((history, index) => (
                  <div key={history.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-walnut rounded-full" />
                      {index < job.statusHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-border my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2">
                        {history.fromStatus && (
                          <>
                            <span className="text-sm text-text-light">{history.fromStatus}</span>
                            <span className="text-text-muted">→</span>
                          </>
                        )}
                        <span className="text-sm font-medium text-text">{history.toStatus}</span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-text-light mt-1">{history.note}</p>
                      )}
                      <p className="text-xs text-text-muted mt-1">
                        by {history.changedBy} • {new Date(history.changedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                {job.statusHistory.length === 0 && (
                  <p className="text-text-light text-center py-4">No status changes recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <Link
                href={`/admin/jobs/${job.id}/deliverables`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📤</span>
                <span className="font-medium text-text">Upload Deliverables</span>
              </Link>
              <a
                href={`mailto:${job.user.email}?subject=Re: ${job.jobNumber} - ${job.title}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📧</span>
                <span className="font-medium text-text">Email Customer</span>
              </a>
              <Link
                href={`/admin/customers/${job.user.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">👤</span>
                <span className="font-medium text-text">View Customer</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-900/30 text-amber-400',
    QUOTED: 'bg-blue-900/30 text-blue-400',
    IN_PROGRESS: 'bg-purple-900/30 text-purple-400',
    REVIEW: 'bg-orange-900/30 text-orange-400',
    REVISION: 'bg-pink-900/30 text-pink-400',
    COMPLETED: 'bg-green-900/30 text-green-400',
    CANCELLED: 'bg-gray-700/30 text-gray-400',
  }

  const labels: Record<string, string> = {
    PENDING: 'Pending',
    QUOTED: 'Quoted',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    REVISION: 'Revision',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.PENDING}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {labels[status] || status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    LOW: 'bg-gray-700/30 text-gray-400',
    NORMAL: 'bg-blue-900/30 text-blue-400',
    HIGH: 'bg-orange-900/30 text-orange-400',
    URGENT: 'bg-red-900/30 text-red-400',
  }

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[priority] || styles.NORMAL}`}>
      {priority}
    </span>
  )
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('dwg') || mimeType.includes('autocad')) return '📐'
  return '📎'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
