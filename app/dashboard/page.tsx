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

  // Fetch subscription info
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id }
  })

  // Fetch pending payments
  const pendingPayments = await prisma.payment.findMany({
    where: { userId: user.id, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: 3
  })

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

      {/* Subscription & Account Status */}
      {subscription ? (
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl border border-blue-700/30 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-3xl">
                📦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-text">Partner Plan</h2>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                    subscription.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <p className="text-text-light text-sm">
                  ${subscription.pricePerCycle}/month • Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-32 h-2 bg-dark-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(subscription.projectsUsedThisMonth / subscription.projectsLimit) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-text">
                  {subscription.projectsUsedThisMonth}/{subscription.projectsLimit}
                </span>
              </div>
              <p className="text-xs text-text-light">Projects this month</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl border border-amber-700/30 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center text-3xl">
                💼
              </div>
              <div>
                <h2 className="text-lg font-bold text-text">Pay-Per-Project</h2>
                <p className="text-text-light text-sm">
                  You're on pay-per-project pricing. Consider Partner plan for savings!
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors text-sm"
            >
              View Plans
            </Link>
          </div>
        </div>
      )}

      {/* Pending Payments Alert */}
      {pendingPayments.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center text-xl">
                💳
              </div>
              <div>
                <p className="font-medium text-red-400">
                  {pendingPayments.length} Pending Payment{pendingPayments.length > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-text-light">
                  Total: ${pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('en-NZ', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors text-sm"
            >
              View Invoices
            </Link>
          </div>
        </div>
      )}

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
