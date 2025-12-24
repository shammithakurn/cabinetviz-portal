// app/admin/jobs/page.tsx
// Admin jobs list with filtering and search

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { status, search } = searchParams

  // Build where clause
  const where: any = {}
  if (status) {
    where.status = status
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { jobNumber: { contains: search } },
      { user: { name: { contains: search } } },
      { user: { email: { contains: search } } },
    ]
  }

  // Fetch jobs
  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true, company: true },
      },
      _count: {
        select: { files: true, deliverables: true, comments: true },
      },
    },
  })

  // Get status counts for filter badges
  const statusCounts = await prisma.job.groupBy({
    by: ['status'],
    _count: true,
  })

  const getCount = (s: string) => statusCounts.find((sc) => sc.status === s)?._count || 0

  const statuses = [
    { key: '', label: 'All', count: jobs.length },
    { key: 'PENDING', label: 'Pending', count: getCount('PENDING'), color: 'amber' },
    { key: 'QUOTED', label: 'Quoted', count: getCount('QUOTED'), color: 'blue' },
    { key: 'IN_PROGRESS', label: 'In Progress', count: getCount('IN_PROGRESS'), color: 'purple' },
    { key: 'REVIEW', label: 'Review', count: getCount('REVIEW'), color: 'orange' },
    { key: 'REVISION', label: 'Revision', count: getCount('REVISION'), color: 'pink' },
    { key: 'COMPLETED', label: 'Completed', count: getCount('COMPLETED'), color: 'green' },
  ]

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">All Jobs</h1>
        <p className="text-text-light mt-1">
          Manage customer jobs, update status, and upload deliverables
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s.key}
            href={s.key ? `/admin/jobs?status=${s.key}` : '/admin/jobs'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              (status || '') === s.key
                ? 'bg-walnut text-white'
                : 'bg-dark-surface text-text-light border border-border hover:border-border-light'
            }`}
          >
            {s.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              (status || '') === s.key
                ? 'bg-white/20'
                : 'bg-dark-elevated'
            }`}>
              {s.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <form className="flex gap-4">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by job title, number, or customer..."
            className="flex-1 px-4 py-2.5 border border-border bg-dark-surface text-text rounded-lg focus:outline-none focus:ring-2 focus:ring-walnut"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-walnut text-white rounded-lg font-medium hover:bg-walnut-dark transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Jobs Table */}
      <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-elevated">
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Job Details
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Customer
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Progress
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Files
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Price
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-dark-elevated transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-text">{job.title}</p>
                      <p className="text-sm text-text-light">{job.jobNumber}</p>
                      <p className="text-xs text-text-muted mt-1">
                        Created {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-text">{job.user.name}</p>
                      <p className="text-sm text-text-light">{job.user.company || job.user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-text">
                      {getProjectTypeIcon(job.projectType)}
                      <span className="capitalize">{job.projectType.toLowerCase().replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-dark-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full bg-walnut rounded-full"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-text-light">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-sm text-text-light">
                      <span title="Uploaded files">📎 {job._count.files}</span>
                      <span title="Deliverables">📤 {job._count.deliverables}</span>
                      <span title="Comments">💬 {job._count.comments}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {job.quotedPrice ? (
                      <span className="font-semibold text-green-400">${job.quotedPrice}</span>
                    ) : (
                      <span className="text-text-muted">Not quoted</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-walnut/20 text-walnut rounded-lg font-medium text-sm hover:bg-walnut/30 transition-colors"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-text-light">
                    No jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

function getProjectTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    KITCHEN: '🍳',
    WARDROBE: '👔',
    BATHROOM_VANITY: '🚿',
    ENTERTAINMENT_UNIT: '📺',
    HOME_OFFICE: '💼',
    LAUNDRY: '🧺',
    CUSTOM: '🔧',
  }
  return icons[type] || '📁'
}
