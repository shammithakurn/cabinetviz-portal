// app/dashboard/billing/page.tsx
// Customer billing page

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Get completed jobs with prices for billing history
  const completedJobs = await prisma.job.findMany({
    where: {
      userId: user.id,
      status: 'COMPLETED',
      quotedPrice: { not: null },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Get pending/unpaid jobs
  const pendingJobs = await prisma.job.findMany({
    where: {
      userId: user.id,
      status: { in: ['QUOTED', 'IN_PROGRESS', 'REVIEW', 'REVISION'] },
      quotedPrice: { not: null },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalSpent = completedJobs.reduce((sum, job) => sum + (job.quotedPrice || 0), 0)
  const pendingTotal = pendingJobs.reduce((sum, job) => sum + (job.quotedPrice || 0), 0)

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Billing</h1>
        <p className="text-text-light mt-1">
          View your billing history and manage payments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-dark-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <p className="text-2xl font-bold text-text">${totalSpent.toLocaleString()}</p>
              <p className="text-sm text-text-light">Total Spent</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl">
              ⏳
            </div>
            <div>
              <p className="text-2xl font-bold text-text">${pendingTotal.toLocaleString()}</p>
              <p className="text-sm text-text-light">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
              📁
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{completedJobs.length}</p>
              <p className="text-sm text-text-light">Completed Orders</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Payments */}
          {pendingJobs.length > 0 && (
            <div className="bg-dark-surface rounded-2xl border border-amber-900/50 overflow-hidden">
              <div className="p-5 border-b border-amber-900/50 bg-amber-900/20">
                <h2 className="font-bold text-amber-400 flex items-center gap-2">
                  <span>⏳</span> Pending Payments
                </h2>
              </div>
              <div className="divide-y divide-border">
                {pendingJobs.map((job) => (
                  <div key={job.id} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text">{job.title}</p>
                      <p className="text-sm text-text-light">{job.jobNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text">${job.quotedPrice}</p>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-sm text-walnut hover:text-accent"
                      >
                        View Job →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing History */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📋</span> Billing History
              </h2>
            </div>
            {completedJobs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-text mb-2">
                  No billing history
                </h3>
                <p className="text-text-light mb-6">
                  Completed orders will appear here
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
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {completedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-dark-elevated transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-semibold text-text hover:text-walnut"
                        >
                          {job.title}
                        </Link>
                        <p className="text-sm text-text-light">{job.jobNumber}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-light">
                        {new Date(job.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-900/30 text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-text">
                        ${job.quotedPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-gradient-to-r from-walnut to-accent">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span>💳</span> Payment Methods
              </h2>
            </div>
            <div className="p-5">
              <p className="text-text-light text-sm mb-4">
                Payments are handled securely via invoice. You'll receive a payment link when your quote is approved.
              </p>
              <div className="flex gap-2">
                <div className="bg-dark-elevated rounded px-3 py-1 text-xs text-text-muted">
                  Visa
                </div>
                <div className="bg-dark-elevated rounded px-3 py-1 text-xs text-text-muted">
                  Mastercard
                </div>
                <div className="bg-dark-elevated rounded px-3 py-1 text-xs text-text-muted">
                  Bank Transfer
                </div>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>❓</span> Need Help?
              </h2>
            </div>
            <div className="p-5">
              <p className="text-text-light text-sm mb-4">
                Questions about billing or payments?
              </p>
              <a
                href="mailto:billing@cabinetviz.com"
                className="w-full py-2 border border-border text-text rounded-lg hover:bg-dark-elevated transition-colors flex items-center justify-center gap-2"
              >
                <span>📧</span>
                Contact Billing Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
