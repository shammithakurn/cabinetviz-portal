// app/dashboard/downloads/page.tsx
// Customer downloads page - view all deliverables across jobs

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function DownloadsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get all deliverables for the user's jobs
  const deliverables = await prisma.deliverable.findMany({
    where: {
      job: {
        userId: user.id,
      },
    },
    include: {
      job: {
        select: { title: true, jobNumber: true, id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const getDeliverableIcon = (type: string) => {
    if (type.startsWith('RENDER_')) return '🖼️'
    if (type.startsWith('DRAWING_')) return '📐'
    if (type === 'CUT_LIST') return '✂️'
    if (type === 'ASSEMBLY_GUIDE') return '🔧'
    if (type === 'MATERIAL_LIST') return '📋'
    return '📄'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '-'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Downloads</h1>
        <p className="text-text-light mt-1">
          Access all your deliverables including renders, drawings, and documents
        </p>
      </div>

      {/* Downloads List */}
      <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
        {deliverables.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📥</div>
            <h3 className="text-lg font-semibold text-text mb-2">
              No downloads yet
            </h3>
            <p className="text-text-light mb-6">
              {"Your renders, drawings, and documents will appear here once they're ready"}
            </p>
            <Link
              href="/dashboard"
              className="btn btn-primary inline-flex"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {deliverables.map((deliverable) => (
              <div
                key={deliverable.id}
                className="flex items-center gap-4 p-5 hover:bg-dark-elevated transition-colors"
              >
                <div className="w-14 h-14 bg-walnut/10 rounded-xl flex items-center justify-center text-2xl">
                  {getDeliverableIcon(deliverable.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text">{deliverable.name}</p>
                  <p className="text-sm text-text-light">
                    {deliverable.type.replace(/_/g, ' ')} • Version {deliverable.version}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    <Link
                      href={`/jobs/${deliverable.job.id}`}
                      className="hover:text-walnut"
                    >
                      {deliverable.job.title} ({deliverable.job.jobNumber})
                    </Link>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-light">
                    {formatFileSize(deliverable.fileSize)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(deliverable.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <a
                  href={deliverable.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-walnut text-white rounded-lg hover:bg-walnut-dark transition-colors flex items-center gap-2"
                >
                  <span>⬇️</span>
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
