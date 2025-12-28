// app/dashboard/jobs/page.tsx
// Customer's jobs list page

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, getStatusColor, getStatusLabel, getProjectTypeIcon } from '@/lib/utils'

export default async function MyJobsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { files: true, deliverables: true, messages: true },
      },
    },
  })

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">My Jobs</h1>
          <p className="text-text-light mt-1">
            View and manage all your cabinet visualization projects
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="btn btn-primary flex items-center gap-2"
        >
          <span>➕</span>
          New Job
        </Link>
      </div>

      {/* Jobs List */}
      <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-text mb-2">
              No jobs yet
            </h3>
            <p className="text-text-light mb-6">
              Create your first job to get started with your cabinet designs
            </p>
            <Link
              href="/jobs/new"
              className="btn btn-primary inline-flex"
            >
              Create Your First Job
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-dark-elevated">
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                  Project
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                  Progress
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                  Files
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                  Quote
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-dark-elevated transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-walnut/10 rounded-xl flex items-center justify-center text-2xl">
                        {getProjectTypeIcon(job.projectType)}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{job.title}</p>
                        <p className="text-sm text-text-light">{job.jobNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        job.status
                      )}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {getStatusLabel(job.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-dark-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full bg-walnut rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-light">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-sm text-text-light">
                      <span>📎 {job._count.files}</span>
                      <span>📥 {job._count.deliverables}</span>
                      <span>💬 {job._count.messages}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {job.quotedPrice ? (
                      <span className="font-semibold text-text">${job.quotedPrice}</span>
                    ) : (
                      <span className="text-text-muted">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-text-light">
                    {formatDate(job.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-walnut hover:text-accent font-medium text-sm"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
