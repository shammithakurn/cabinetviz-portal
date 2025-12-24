// app/dashboard/page.tsx
// Main dashboard page with stats and recent jobs

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, getStatusColor, getStatusLabel, getProjectTypeIcon } from '@/lib/utils'
import type { Job } from '@prisma/client'

type JobWithCounts = Job & {
  _count: {
    files: number
    deliverables: number
  }
}

type StatusCount = {
  status: string
  _count: number
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Fetch user's jobs with stats
  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      _count: {
        select: { files: true, deliverables: true },
      },
    },
  })

  // Calculate stats
  const stats = await prisma.job.groupBy({
    by: ['status'],
    where: { userId: user.id },
    _count: true,
  })

  const totalJobs = jobs.length
  const inProgress = stats.find((s: StatusCount) => s.status === 'IN_PROGRESS')?._count || 0
  const completed = stats.find((s: StatusCount) => s.status === 'COMPLETED')?._count || 0
  const pendingReview = stats.find((s: StatusCount) => s.status === 'REVIEW')?._count || 0

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">
          Welcome back, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-text-light mt-1">
          Here's an overview of your cabinet visualization projects
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="📁"
          iconBg="bg-blue-900/30"
          label="Total Jobs"
          value={totalJobs}
        />
        <StatCard
          icon="⏳"
          iconBg="bg-amber-900/30"
          label="In Progress"
          value={inProgress}
        />
        <StatCard
          icon="👀"
          iconBg="bg-purple-900/30"
          label="Ready for Review"
          value={pendingReview}
        />
        <StatCard
          icon="✅"
          iconBg="bg-green-900/30"
          label="Completed"
          value={completed}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-walnut to-walnut-dark rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1 text-warm-white">Ready to start a new project?</h2>
            <p className="text-warm-white/80">
              Submit your measurements and sketches to get started
            </p>
          </div>
          <Link
            href="/jobs/new"
            className="bg-warm-white text-walnut-dark px-6 py-3 rounded-xl font-semibold hover:bg-text transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Create New Job
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">Recent Jobs</h2>
          <Link
            href="/dashboard/jobs"
            className="text-walnut hover:text-accent text-sm font-medium"
          >
            View All →
          </Link>
        </div>

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
                  Created
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {jobs.map((job: JobWithCounts) => (
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
                    </div>
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

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: string
  iconBg: string
  label: string
  value: number
}) {
  return (
    <div className="bg-dark-surface rounded-2xl border border-border p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-text">{value}</p>
          <p className="text-sm text-text-light">{label}</p>
        </div>
      </div>
    </div>
  )
}
