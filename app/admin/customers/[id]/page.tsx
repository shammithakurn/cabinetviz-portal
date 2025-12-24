// app/admin/customers/[id]/page.tsx
// Admin page for viewing and editing customer details

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

interface Props {
  params: { id: string }
}

export default async function CustomerDetailPage({ params }: Props) {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
    redirect('/auth/login')
  }

  const customer = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      jobs: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { files: true, deliverables: true, comments: true },
          },
        },
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!customer || customer.role !== 'CUSTOMER') {
    notFound()
  }

  async function updateCustomer(formData: FormData) {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return
    }

    const name = formData.get('name') as string
    const company = formData.get('company') as string
    const phone = formData.get('phone') as string

    await prisma.user.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        company: company.trim() || null,
        phone: phone.trim() || null,
      },
    })

    revalidatePath(`/admin/customers/${params.id}`)
  }

  // Calculate stats
  const totalJobs = customer.jobs.length
  const completedJobs = customer.jobs.filter((j) => j.status === 'COMPLETED').length
  const activeJobs = customer.jobs.filter((j) =>
    ['PENDING', 'QUOTED', 'IN_PROGRESS', 'REVIEW', 'REVISION'].includes(j.status)
  ).length
  const totalSpent = customer.jobs
    .filter((j) => j.status === 'COMPLETED' && j.quotedPrice)
    .reduce((sum, j) => sum + (j.quotedPrice || 0), 0)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-900/30 text-amber-400',
    QUOTED: 'bg-blue-900/30 text-blue-400',
    IN_PROGRESS: 'bg-purple-900/30 text-purple-400',
    REVIEW: 'bg-orange-900/30 text-orange-400',
    REVISION: 'bg-pink-900/30 text-pink-400',
    COMPLETED: 'bg-green-900/30 text-green-400',
    CANCELLED: 'bg-gray-700/30 text-gray-400',
  }

  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-light">
          <Link href="/admin" className="hover:text-walnut">Dashboard</Link>
          <span>→</span>
          <Link href="/admin/customers" className="hover:text-walnut">Customers</Link>
          <span>→</span>
          <span className="text-text font-medium">{customer.name}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-walnut to-accent rounded-full flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">{customer.name}</h1>
            <p className="text-text-light">{customer.company || 'Individual Customer'}</p>
          </div>
        </div>
        <Link
          href="/admin/customers"
          className="px-4 py-2 text-text-light hover:text-text border border-border rounded-lg hover:bg-dark-elevated transition-colors"
        >
          ← Back to Customers
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center text-xl">
              📁
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{totalJobs}</p>
              <p className="text-xs text-text-light">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center text-xl">
              🔨
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{activeJobs}</p>
              <p className="text-xs text-text-light">Active Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{completedJobs}</p>
              <p className="text-xs text-text-light">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center text-xl">
              💰
            </div>
            <div>
              <p className="text-2xl font-bold text-text">${totalSpent.toLocaleString()}</p>
              <p className="text-xs text-text-light">Total Spent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jobs List */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated flex items-center justify-between">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📁</span> Customer Jobs ({customer.jobs.length})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {customer.jobs.map((job) => (
                <div key={job.id} className="p-5 hover:bg-dark-elevated transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="font-semibold text-text hover:text-walnut"
                        >
                          {job.title}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[job.status]}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-text-light">{job.jobNumber} • {job.projectType}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                        <span>📎 {job._count.files} files</span>
                        <span>📤 {job._count.deliverables} deliverables</span>
                        <span>💬 {job._count.comments} comments</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {job.quotedPrice && (
                        <p className="font-semibold text-text">${job.quotedPrice}</p>
                      )}
                      <p className="text-xs text-text-light">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-dark-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-walnut rounded-full transition-all"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-light w-10">{job.progress}%</span>
                  </div>
                </div>
              ))}
              {customer.jobs.length === 0 && (
                <div className="p-12 text-center text-text-light">
                  <div className="text-4xl mb-4">📭</div>
                  <p>No jobs yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>🔔</span> Recent Notifications
              </h2>
            </div>
            <div className="divide-y divide-border">
              {customer.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${notification.isRead ? '' : 'bg-walnut/10'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-dark-elevated rounded-full flex items-center justify-center text-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text">{notification.title}</p>
                      <p className="text-sm text-text-light">{notification.message}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {customer.notifications.length === 0 && (
                <div className="p-8 text-center text-text-light">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Right column */}
        <div className="space-y-6">
          {/* Customer Details Form */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden sticky top-8">
            <div className="p-5 border-b border-border bg-gradient-to-r from-walnut to-accent">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span>👤</span> Customer Details
              </h2>
            </div>
            <form action={updateCustomer} className="p-5 space-y-4">
              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-dark-elevated border border-border rounded-lg text-text-muted cursor-not-allowed"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={customer.name}
                  required
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Company</label>
                <input
                  type="text"
                  name="company"
                  defaultValue={customer.company || ''}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={customer.phone || ''}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                />
              </div>

              {/* Account Info */}
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-text-light">Member since</span>
                  <span className="text-text">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">Last updated</span>
                  <span className="text-text">
                    {new Date(customer.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {user.role === 'ADMIN' && (
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-walnut to-accent text-white font-bold rounded-lg hover:from-walnut-dark hover:to-walnut transition-all shadow-lg"
                >
                  Update Customer
                </button>
              )}
            </form>
          </div>

          {/* Quick Actions */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📧</span>
                <span className="font-medium text-text">Send Email</span>
              </a>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
                >
                  <span className="text-xl">📞</span>
                  <span className="font-medium text-text">Call Customer</span>
                </a>
              )}
              <Link
                href={`/admin/jobs?customer=${customer.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📁</span>
                <span className="font-medium text-text">View All Jobs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    JOB_CREATED: '📁',
    STATUS_UPDATE: '🔄',
    NEW_COMMENT: '💬',
    DELIVERABLE_READY: '📤',
    QUOTE_SENT: '💰',
    PAYMENT_RECEIVED: '✅',
  }
  return icons[type] || '🔔'
}
