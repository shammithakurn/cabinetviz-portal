// app/admin/reports/page.tsx
// Admin reports and analytics page

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function ReportsPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
    redirect('/auth/login')
  }

  // Fetch all data for analytics
  const [jobs, customers, comments] = await Promise.all([
    prisma.job.findMany({
      include: {
        user: { select: { name: true, company: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: 'CUSTOMER' },
    }),
    prisma.message.findMany(),
  ])

  // Job Statistics
  const totalJobs = jobs.length
  const jobsByStatus = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const jobsByType = jobs.reduce((acc, job) => {
    acc[job.projectType] = (acc[job.projectType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const jobsByPriority = jobs.reduce((acc, job) => {
    acc[job.priority] = (acc[job.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Revenue Statistics
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED')
  const totalRevenue = completedJobs.reduce((sum, j) => sum + (j.quotedPrice || 0), 0)
  const pendingRevenue = jobs
    .filter((j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED' && j.quotedPrice)
    .reduce((sum, j) => sum + (j.quotedPrice || 0), 0)
  const avgJobValue = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0

  // Customer Statistics
  const totalCustomers = customers.length
  const activeCustomers = new Set(
    jobs
      .filter((j) => ['PENDING', 'QUOTED', 'IN_PROGRESS', 'REVIEW', 'REVISION'].includes(j.status))
      .map((j) => j.userId)
  ).size
  const avgJobsPerCustomer = totalCustomers > 0 ? totalJobs / totalCustomers : 0

  // Monthly job trends (last 6 months)
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const monthlyJobs = Array.from({ length: 6 }, (_, i) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
    const count = jobs.filter((j) => {
      const created = new Date(j.createdAt)
      return created >= monthDate && created <= monthEnd
    }).length
    return {
      month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      count,
    }
  })

  // Recent completions
  const recentCompleted = jobs
    .filter((j) => j.status === 'COMPLETED')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  // Top customers by revenue
  const customerRevenue = jobs
    .filter((j) => j.status === 'COMPLETED' && j.quotedPrice)
    .reduce((acc, job) => {
      const key = job.userId
      if (!acc[key]) {
        acc[key] = { userId: key, name: job.user.name, company: job.user.company, total: 0, jobs: 0 }
      }
      acc[key].total += job.quotedPrice || 0
      acc[key].jobs += 1
      return acc
    }, {} as Record<string, { userId: string; name: string; company: string | null; total: number; jobs: number }>)

  const topCustomers = Object.values(customerRevenue)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  const statusLabels: Record<string, string> = {
    PENDING: 'Pending',
    QUOTED: 'Quoted',
    IN_PROGRESS: 'In Progress',
    REVIEW: 'Review',
    REVISION: 'Revision',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500',
    QUOTED: 'bg-blue-500',
    IN_PROGRESS: 'bg-purple-500',
    REVIEW: 'bg-orange-500',
    REVISION: 'bg-pink-500',
    COMPLETED: 'bg-green-500',
    CANCELLED: 'bg-gray-500',
  }

  const typeLabels: Record<string, string> = {
    KITCHEN: 'Kitchen',
    WARDROBE: 'Wardrobe',
    BATHROOM_VANITY: 'Bathroom Vanity',
    ENTERTAINMENT_UNIT: 'Entertainment Unit',
    HOME_OFFICE: 'Home Office',
    LAUNDRY: 'Laundry',
    CUSTOM: 'Custom',
  }

  const maxMonthlyJobs = Math.max(...monthlyJobs.map((m) => m.count), 1)

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Reports & Analytics</h1>
        <p className="text-text-light mt-1">Business insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-walnut to-accent rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-4xl opacity-50">💰</div>
          </div>
          <p className="text-white/60 text-sm mt-3">
            +${pendingRevenue.toLocaleString()} pending
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed Jobs</p>
              <p className="text-3xl font-bold mt-1">{completedJobs.length}</p>
            </div>
            <div className="text-4xl opacity-50">✅</div>
          </div>
          <p className="text-green-200 text-sm mt-3">
            {totalJobs > 0 ? Math.round((completedJobs.length / totalJobs) * 100) : 0}% completion rate
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Customers</p>
              <p className="text-3xl font-bold mt-1">{activeCustomers}</p>
            </div>
            <div className="text-4xl opacity-50">👥</div>
          </div>
          <p className="text-purple-200 text-sm mt-3">
            of {totalCustomers} total customers
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Avg Job Value</p>
              <p className="text-3xl font-bold mt-1">${Math.round(avgJobValue)}</p>
            </div>
            <div className="text-4xl opacity-50">📊</div>
          </div>
          <p className="text-amber-200 text-sm mt-3">
            {avgJobsPerCustomer.toFixed(1)} jobs per customer
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Trends */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📈</span> Job Trends (Last 6 Months)
              </h2>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between gap-4 h-48">
                {monthlyJobs.map((month, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center justify-end h-36">
                      <span className="text-sm font-medium text-text mb-1">{month.count}</span>
                      <div
                        className="w-full bg-gradient-to-t from-walnut to-accent rounded-t-lg transition-all"
                        style={{ height: `${(month.count / maxMonthlyJobs) * 100}%`, minHeight: month.count > 0 ? '8px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-text-muted">{month.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs by Status */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📊</span> Jobs by Status
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                {Object.entries(jobsByStatus)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-light">{statusLabels[status] || status}</span>
                        <span className="font-semibold text-text">
                          {count} ({Math.round((count / totalJobs) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-dark-elevated rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statusColors[status] || 'bg-gray-500'} rounded-full transition-all`}
                          style={{ width: `${(count / totalJobs) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Jobs by Type */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>🏠</span> Jobs by Project Type
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(jobsByType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="bg-dark-elevated rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-text">{count}</p>
                      <p className="text-sm text-text-light">{typeLabels[type] || type}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Top Customers */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>🏆</span> Top Customers by Revenue
              </h2>
            </div>
            <div className="divide-y divide-border">
              {topCustomers.map((customer, i) => (
                <Link
                  key={customer.userId}
                  href={`/admin/customers/${customer.userId}`}
                  className="flex items-center gap-3 p-4 hover:bg-dark-elevated transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                    i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-gray-500' : i === 2 ? 'bg-amber-700' : 'bg-gray-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">{customer.name}</p>
                    <p className="text-xs text-text-muted">{customer.jobs} jobs</p>
                  </div>
                  <p className="font-bold text-text">${customer.total.toLocaleString()}</p>
                </Link>
              ))}
              {topCustomers.length === 0 && (
                <div className="p-8 text-center text-text-light">
                  No completed jobs yet
                </div>
              )}
            </div>
          </div>

          {/* Recent Completions */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>✅</span> Recent Completions
              </h2>
            </div>
            <div className="divide-y divide-border">
              {recentCompleted.map((job) => (
                <Link
                  key={job.id}
                  href={`/admin/jobs/${job.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-dark-elevated transition-colors"
                >
                  <div className="w-8 h-8 bg-green-900/30 rounded-full flex items-center justify-center text-sm">
                    ✅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">{job.title}</p>
                    <p className="text-xs text-text-muted">{job.jobNumber}</p>
                  </div>
                  {job.quotedPrice && (
                    <p className="font-semibold text-green-400">${job.quotedPrice}</p>
                  )}
                </Link>
              ))}
              {recentCompleted.length === 0 && (
                <div className="p-8 text-center text-text-light">
                  No completed jobs yet
                </div>
              )}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>🚦</span> Priority Distribution
              </h2>
            </div>
            <div className="p-5">
              <div className="flex gap-2">
                {['URGENT', 'HIGH', 'NORMAL', 'LOW'].map((priority) => {
                  const count = jobsByPriority[priority] || 0
                  const colors: Record<string, string> = {
                    URGENT: 'bg-red-500',
                    HIGH: 'bg-orange-500',
                    NORMAL: 'bg-walnut',
                    LOW: 'bg-gray-500',
                  }
                  return (
                    <div key={priority} className="flex-1 text-center">
                      <div
                        className={`${colors[priority]} text-white rounded-lg py-3 mb-2`}
                      >
                        <p className="text-2xl font-bold">{count}</p>
                      </div>
                      <p className="text-xs text-text-muted">{priority}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
