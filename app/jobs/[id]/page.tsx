// app/jobs/[id]/page.tsx
// Job detail page with status, files, comments, and deliverables

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  formatDate,
  formatRelativeTime,
  formatFileSize,
  getStatusColor,
  getStatusLabel,
  getProjectTypeIcon,
  getProjectTypeLabel,
} from '@/lib/utils'
import { JobFileUploader } from '@/components/JobFileUploader'

export default async function JobDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      files: {
        orderBy: { uploadedAt: 'desc' },
      },
      deliverables: {
        orderBy: { createdAt: 'desc' },
      },
      comments: {
        where: { isInternal: false },
        orderBy: { createdAt: 'desc' },
      },
      statusHistory: {
        orderBy: { changedAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!job || job.userId !== user.id) {
    notFound()
  }

  const uploadedFiles = job.files.filter(
    (f) => !['RENDER_3D', 'DRAWING_2D', 'CUT_LIST'].includes(f.category)
  )

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-text-light hover:text-walnut mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-walnut/10 rounded-2xl flex items-center justify-center text-3xl">
              {getProjectTypeIcon(job.projectType)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">{job.title}</h1>
              <p className="text-text-light">
                {job.jobNumber} · {getProjectTypeLabel(job.projectType)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                job.status
              )}`}
            >
              <span className="w-2 h-2 rounded-full bg-current"></span>
              {getStatusLabel(job.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Progress */}
          <div className="bg-dark-surface rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text">Progress</h2>
              <span className="text-2xl font-bold text-walnut">{job.progress}%</span>
            </div>
            <div className="w-full h-3 bg-dark-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-walnut to-accent rounded-full transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-sm text-text-muted">
              <span>Started</span>
              <span>In Progress</span>
              <span>Review</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-dark-surface rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text mb-4">Deliverables</h2>

            {job.deliverables.length === 0 ? (
              <div className="text-center py-10 text-text-light">
                <div className="text-5xl mb-3">📥</div>
                <p className="font-medium">No deliverables yet</p>
                <p className="text-sm text-text-muted">Files will appear here when ready for download</p>
              </div>
            ) : (
              <div className="space-y-3">
                {job.deliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className="flex items-center gap-4 p-4 bg-dark-elevated rounded-xl hover:bg-dark-elevated/80 transition-colors"
                  >
                    <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center text-xl">
                      {deliverable.type.includes('RENDER') ? '🖼️' : '📄'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text">{deliverable.name}</p>
                      <p className="text-sm text-text-light">
                        {formatFileSize(deliverable.fileSize)} · v{deliverable.version}
                      </p>
                    </div>
                    <a
                      href={deliverable.fileUrl}
                      download
                      className="btn btn-primary btn-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uploaded Files */}
          <div className="bg-dark-surface rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text mb-4">Your Uploaded Files</h2>

            {uploadedFiles.length === 0 ? (
              <div className="text-center py-6 text-text-light">
                <div className="text-4xl mb-2">📁</div>
                <p className="font-medium">No files uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-dark-elevated rounded-xl"
                  >
                    <div className="w-10 h-10 bg-dark-surface rounded-lg flex items-center justify-center text-lg">
                      {file.mimeType.startsWith('image/') ? '🖼️' : '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text truncate text-sm">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-text-light">
                        {file.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload More Files */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-text mb-3">Upload Additional Files</h3>
              <JobFileUploader jobId={job.id} />
            </div>
          </div>

          {/* Comments */}
          <div className="bg-dark-surface rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold text-text mb-4">Comments</h2>

            {job.comments.length === 0 ? (
              <div className="text-center py-10 text-text-light">
                <div className="text-5xl mb-3">💬</div>
                <p className="font-medium">No comments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {job.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-9 h-9 bg-walnut/20 rounded-full flex items-center justify-center text-sm font-semibold text-walnut">
                      {comment.authorName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-text-muted">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-text-light">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            <form className="mt-6 pt-6 border-t border-border">
              <textarea
                className="input min-h-[80px] mb-3"
                placeholder="Add a comment or ask a question..."
              />
              <button type="submit" className="btn btn-primary">
                Send Comment
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Info */}
          <div className="bg-dark-surface rounded-2xl border border-border p-6">
            <h3 className="font-bold text-text mb-4">Job Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-light">Created</dt>
                <dd className="font-medium text-text">{formatDate(job.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-light">Package</dt>
                <dd className="font-medium text-text">{job.package}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-light">Priority</dt>
                <dd className="font-medium text-text">{job.priority}</dd>
              </div>
              {job.deadline && (
                <div className="flex justify-between">
                  <dt className="text-text-light">Deadline</dt>
                  <dd className="font-medium text-text">{formatDate(job.deadline)}</dd>
                </div>
              )}
              {job.quotedPrice && (
                <div className="flex justify-between">
                  <dt className="text-text-light">Quote</dt>
                  <dd className="font-medium text-green-400">
                    ${job.quotedPrice.toFixed(2)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Dimensions */}
          {(job.roomWidth || job.roomLength || job.roomHeight) && (
            <div className="bg-dark-surface rounded-2xl border border-border p-6">
              <h3 className="font-bold text-text mb-4">Dimensions</h3>
              <dl className="space-y-3 text-sm">
                {job.roomWidth && (
                  <div className="flex justify-between">
                    <dt className="text-text-light">Width</dt>
                    <dd className="font-medium text-text">
                      {job.roomWidth} {job.dimensionUnit}
                    </dd>
                  </div>
                )}
                {job.roomLength && (
                  <div className="flex justify-between">
                    <dt className="text-text-light">Length</dt>
                    <dd className="font-medium text-text">
                      {job.roomLength} {job.dimensionUnit}
                    </dd>
                  </div>
                )}
                {job.roomHeight && (
                  <div className="flex justify-between">
                    <dt className="text-text-light">Height</dt>
                    <dd className="font-medium text-text">
                      {job.roomHeight} {job.dimensionUnit}
                    </dd>
                  </div>
                )}
                {job.roomType && (
                  <div className="flex justify-between">
                    <dt className="text-text-light">Layout</dt>
                    <dd className="font-medium text-text">{job.roomType.replace('_', ' ')}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Style */}
          {(job.cabinetStyle || job.materialType || job.colorScheme) && (
            <div className="bg-dark-surface rounded-2xl border border-border p-6">
              <h3 className="font-bold text-text mb-4">Style</h3>
              <dl className="space-y-3 text-sm">
                {job.cabinetStyle && (
                  <div className="flex justify-between">
                    <dt className="text-text-light">Style</dt>
                    <dd className="font-medium text-text">{job.cabinetStyle}</dd>
                  </div>
                )}
                {job.materialType && (
                  <div className="flex justify-between">
                    <dt className="text-text-light">Material</dt>
                    <dd className="font-medium text-text">{job.materialType}</dd>
                  </div>
                )}
                {job.colorScheme && (
                  <div className="flex justify-between">
                    <dt className="text-text-light">Color</dt>
                    <dd className="font-medium text-text">{job.colorScheme}</dd>
                  </div>
                )}
                {job.handleStyle && (
                  <div className="flex justify-between">
                    <dt className="text-text-light">Handles</dt>
                    <dd className="font-medium text-text">{job.handleStyle}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Status History */}
          <div className="bg-dark-surface rounded-2xl border border-border p-6">
            <h3 className="font-bold text-text mb-4">Activity</h3>
            <div className="space-y-4">
              {job.statusHistory.map((history, index) => (
                <div key={history.id} className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 bg-walnut rounded-full mt-2" />
                    {index < job.statusHistory.length - 1 && (
                      <div className="absolute top-4 left-[3px] w-0.5 h-full bg-border" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">
                      Status changed to {getStatusLabel(history.toStatus)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatRelativeTime(history.changedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
