// app/admin/page.tsx
// Enhanced Admin dashboard with overview stats, pending actions, and recent activity

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Fetch all jobs grouped by status
  const statusCounts = await prisma.job.groupBy({
    by: ['status'],
    _count: true,
  })

  // Calculate totals
  const totalJobs = statusCounts.reduce((acc, s) => acc + s._count, 0)
  const pending = statusCounts.find((s) => s.status === 'PENDING')?._count || 0
  const inProgress = statusCounts.find((s) => s.status === 'IN_PROGRESS')?._count || 0
  const review = statusCounts.find((s) => s.status === 'REVIEW')?._count || 0
  const completed = statusCounts.find((s) => s.status === 'COMPLETED')?._count || 0

  // Recent jobs
  const recentJobs = await prisma.job.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 10,
    include: {
      user: {
        select: { name: true, email: true, company: true },
      },
      _count: {
        select: { files: true, deliverables: true, comments: true },
      },
    },
  })

  // Customer count
  const customerCount = await prisma.user.count({
    where: { role: 'CUSTOMER' },
  })

  // Recent activity (comments)
  const recentComments = await prisma.comment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      job: { select: { title: true, jobNumber: true, id: true } },
    },
  })

  // Pending actions - Jobs needing attention
  const pendingJobs = await prisma.job.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
    take: 5,
    include: {
      user: { select: { name: true, company: true } },
    },
  })

  const reviewJobs = await prisma.job.findMany({
    where: { status: 'REVIEW' },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    include: {
      user: { select: { name: true, company: true } },
    },
  })

  // Revenue stats
  const completedJobsWithPrice = await prisma.job.findMany({
    where: { status: 'COMPLETED', quotedPrice: { not: null } },
    select: { quotedPrice: true },
  })
  const totalRevenue = completedJobsWithPrice.reduce((sum, j) => sum + (j.quotedPrice || 0), 0)

  // Recent new customers (last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const newCustomers = await prisma.user.findMany({
    where: {
      role: 'CUSTOMER',
      createdAt: { gte: weekAgo },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Server action for quick status update
  async function quickStatusUpdate(formData: FormData) {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'DESIGNER')) {
      return
    }

    const jobId = formData.get('jobId') as string
    const newStatus = formData.get('status') as string

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) return

    await prisma.job.update({
      where: { id: jobId },
      data: { status: newStatus },
    })

    await prisma.statusHistory.create({
      data: {
        jobId,
        fromStatus: job.status,
        toStatus: newStatus,
        changedBy: currentUser.name,
        note: 'Quick update from dashboard',
      },
    })

    revalidatePath('/admin')
  }

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">
          Welcome back, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-text-light mt-1">
          Here&apos;s what&apos;s happening with your cabinet visualization business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon="📁"
          iconBg="bg-blue-900/30"
          label="Total Jobs"
          value={totalJobs}
          href="/admin/jobs"
        />
        <StatCard
          icon="⏳"
          iconBg="bg-amber-900/30"
          label="Pending"
          value={pending}
          href="/admin/jobs?status=PENDING"
          highlight={pending > 0}
        />
        <StatCard
          icon="🔨"
          iconBg="bg-purple-900/30"
          label="In Progress"
          value={inProgress}
          href="/admin/jobs?status=IN_PROGRESS"
        />
        <StatCard
          icon="👀"
          iconBg="bg-orange-900/30"
          label="Ready for Review"
          value={review}
          href="/admin/jobs?status=REVIEW"
          highlight={review > 0}
        />
        <StatCard
          icon="👥"
          iconBg="bg-green-900/30"
          label="Customers"
          value={customerCount}
          href="/admin/customers"
        />
        <StatCard
          icon="💰"
          iconBg="bg-emerald-900/30"
          label="Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          href="/admin/reports"
          isText
        />
      </div>

      {/* Pending Actions Section */}
      {(pending > 0 || review > 0) && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Action Required
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pending Jobs - Need Quotes */}
            {pendingJobs.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-amber-700/30 bg-amber-900/30">
                  <h3 className="font-semibold text-amber-400 flex items-center gap-2">
                    <span>⏳</span> Jobs Awaiting Quote ({pending})
                  </h3>
                </div>
                <div className="divide-y divide-amber-900/20">
                  {pendingJobs.map((job) => (
                    <div key={job.id} className="p-4 flex items-center justify-between">
                      <div>
                        <Link href={`/admin/jobs/${job.id}`} className="font-medium text-text hover:text-amber-400">
                          {job.title}
                        </Link>
                        <p className="text-sm text-text-light">{job.user.name} • {job.jobNumber}</p>
                      </div>
                      <form action={quickStatusUpdate} className="flex items-center gap-2">
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="status" value="QUOTED" />
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="px-3 py-1.5 text-amber-400 hover:bg-amber-900/30 rounded-lg text-sm font-medium"
                        >
                          View
                        </Link>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Jobs - Need Approval */}
            {reviewJobs.length > 0 && (
              <div className="bg-orange-900/20 border border-orange-700/30 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-orange-700/30 bg-orange-900/30">
                  <h3 className="font-semibold text-orange-400 flex items-center gap-2">
                    <span>👀</span> Ready for Review ({review})
                  </h3>
                </div>
                <div className="divide-y divide-orange-900/20">
                  {reviewJobs.map((job) => (
                    <div key={job.id} className="p-4 flex items-center justify-between">
                      <div>
                        <Link href={`/admin/jobs/${job.id}`} className="font-medium text-text hover:text-orange-400">
                          {job.title}
                        </Link>
                        <p className="text-sm text-text-light">{job.user.name} • {job.jobNumber}</p>
                      </div>
                      <form action={quickStatusUpdate} className="flex items-center gap-2">
                        <input type="hidden" name="jobId" value={job.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Mark Complete
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <QuickAction
          icon="📋"
          title="View Pending"
          description="Quote new jobs"
          href="/admin/jobs?status=PENDING"
          color="amber"
        />
        <QuickAction
          icon="📤"
          title="Deliverables"
          description="Upload renders"
          href="/admin/jobs?status=IN_PROGRESS"
          color="blue"
        />
        <QuickAction
          icon="💬"
          title="Messages"
          description="Reply to customers"
          href="/admin/jobs"
          color="purple"
        />
        <QuickAction
          icon="📈"
          title="Reports"
          description="View analytics"
          href="/admin/reports"
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Jobs Table */}
        <div className="lg:col-span-2 bg-dark-surface rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">Recent Jobs</h2>
            <Link
              href="/admin/jobs"
              className="text-walnut hover:text-accent text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-elevated">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase">
                    Job
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase">
                    Progress
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-dark-elevated transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-text">{job.title}</p>
                        <p className="text-sm text-text-light">{job.jobNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-text">{job.user.name}</p>
                        <p className="text-sm text-text-light">{job.user.company || job.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-dark-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-walnut rounded-full"
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-text-light">{job.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/jobs/${job.id}`}
                        className="text-walnut hover:text-accent font-medium text-sm"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
                {recentJobs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-light">
                      No jobs yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold text-text">Recent Activity</h2>
            </div>
            <div className="p-4 space-y-4">
              {recentComments.map((comment) => (
                <Link
                  key={comment.id}
                  href={`/admin/jobs/${comment.job.id}`}
                  className="flex gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
                >
                  <div className="w-8 h-8 bg-dark-elevated rounded-full flex items-center justify-center text-sm">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {comment.authorName}
                    </p>
                    <p className="text-sm text-text-light truncate">{comment.content}</p>
                    <p className="text-xs text-text-muted mt-1">
                      on {comment.job.jobNumber}
                    </p>
                  </div>
                </Link>
              ))}
              {recentComments.length === 0 && (
                <p className="text-center text-text-light py-8">No recent activity</p>
              )}
            </div>
          </div>

          {/* New Customers */}
          {newCustomers.length > 0 && (
            <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-bold text-text">New Customers (7 days)</h2>
              </div>
              <div className="p-4 space-y-3">
                {newCustomers.map((customer) => (
                  <Link
                    key={customer.id}
                    href={`/admin/customers/${customer.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-elevated transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-walnut to-accent rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{customer.name}</p>
                      <p className="text-xs text-text-light truncate">{customer.company || customer.email}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  href,
  highlight = false,
  isText = false,
}: {
  icon: string
  iconBg: string
  label: string
  value: number | string
  href: string
  highlight?: boolean
  isText?: boolean
}) {
  return (
    <Link href={href} className={`bg-dark-surface rounded-xl border p-4 hover:shadow-md transition-all ${highlight ? 'border-amber-500/50 ring-2 ring-amber-500/20' : 'border-border'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center text-xl`}>
          {icon}
        </div>
        <div>
          <p className={`${isText ? 'text-lg' : 'text-2xl'} font-bold text-text`}>{value}</p>
          <p className="text-xs text-text-light">{label}</p>
        </div>
      </div>
    </Link>
  )
}

function QuickAction({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: string
  title: string
  description: string
  href: string
  color: 'amber' | 'blue' | 'purple' | 'green'
}) {
  const colors = {
    amber: 'from-amber-500 to-orange-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
  }

  return (
    <Link href={href} className={`bg-gradient-to-r ${colors[color]} rounded-xl p-4 text-white hover:shadow-lg transition-all hover:-translate-y-0.5`}>
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-white/80">{description}</p>
    </Link>
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
