// app/dashboard/billing/page.tsx
// Customer billing page with subscription and payment management

import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  // Fetch subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id }
  })

  // Fetch payments
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  const paidPayments = payments.filter(p => p.status === 'PAID')

  // Calculate totals
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const pendingTotal = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

  // Get completed jobs with prices for legacy billing history
  const completedJobs = await prisma.job.findMany({
    where: {
      userId: user.id,
      status: 'COMPLETED',
      quotedPrice: { not: null },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-900/30 text-green-400'
      case 'PENDING': return 'bg-amber-900/30 text-amber-400'
      case 'OVERDUE': return 'bg-red-900/30 text-red-400'
      case 'REFUNDED': return 'bg-purple-900/30 text-purple-400'
      default: return 'bg-gray-700/30 text-gray-400'
    }
  }

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Billing & Subscription</h1>
        <p className="text-text-light mt-1">
          Manage your subscription and view payment history
        </p>
      </div>

      {/* Subscription Card */}
      {subscription ? (
        <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl border border-blue-700/30 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-4xl">
                📦
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-text">Partner Plan</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    subscription.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                    subscription.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <p className="text-text-light">
                  {formatCurrency(subscription.pricePerCycle)}/{subscription.billingCycle.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-dark-surface/50 rounded-xl p-4">
                <p className="text-xs text-text-light mb-1">Projects Used</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-dark-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(subscription.projectsUsedThisMonth / subscription.projectsLimit) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text">
                    {subscription.projectsUsedThisMonth}/{subscription.projectsLimit}
                  </span>
                </div>
              </div>
              <div className="bg-dark-surface/50 rounded-xl p-4">
                <p className="text-xs text-text-light mb-1">Current Period</p>
                <p className="text-sm font-medium text-text">
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
              <div className="bg-dark-surface/50 rounded-xl p-4">
                <p className="text-xs text-text-light mb-1">Next Billing</p>
                <p className="text-sm font-medium text-text">
                  {formatDate(subscription.currentPeriodEnd)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-2xl border border-amber-700/30 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-4xl">
                💼
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Pay-Per-Project</h2>
                <p className="text-text-light">
                  You're on pay-per-project pricing
                </p>
              </div>
            </div>
            <div className="bg-dark-surface/50 rounded-xl p-5">
              <h3 className="font-semibold text-text mb-2">Upgrade to Partner Plan</h3>
              <p className="text-sm text-text-light mb-3">
                $499/month for 5 projects. Save up to 50% on visualizations!
              </p>
              <button className="w-full px-4 py-2 bg-walnut text-white rounded-lg font-medium hover:bg-walnut-dark transition-colors text-sm">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-dark-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center text-2xl">
              ✅
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{formatCurrency(totalPaid)}</p>
              <p className="text-sm text-text-light">Total Paid</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-900/30 rounded-xl flex items-center justify-center text-2xl">
              ⏳
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{formatCurrency(pendingTotal)}</p>
              <p className="text-sm text-text-light">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{paidPayments.length}</p>
              <p className="text-sm text-text-light">Paid Invoices</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-2xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl">
              📁
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{completedJobs.length}</p>
              <p className="text-sm text-text-light">Completed Projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Payments */}
          {pendingPayments.length > 0 && (
            <div className="bg-dark-surface rounded-2xl border border-amber-900/50 overflow-hidden">
              <div className="p-5 border-b border-amber-900/50 bg-amber-900/20">
                <h2 className="font-bold text-amber-400 flex items-center gap-2">
                  <span>⏳</span> Pending Payments ({pendingPayments.length})
                </h2>
              </div>
              <div className="divide-y divide-border">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-text">{payment.description}</p>
                      <p className="text-sm text-text-light">
                        {payment.invoiceNumber || 'No invoice'} • {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-text">{formatCurrency(payment.amount)}</p>
                      {payment.discountAmount && payment.discountAmount > 0 && (
                        <p className="text-xs text-green-400">-{formatCurrency(payment.discountAmount)} discount</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>📋</span> Payment History
              </h2>
            </div>
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-text mb-2">
                  No payment history
                </h3>
                <p className="text-text-light mb-6">
                  Your payments and invoices will appear here
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
                      Invoice
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-text-light uppercase tracking-wider">
                      Type
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
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-dark-elevated transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text">{payment.invoiceNumber || '-'}</p>
                        <p className="text-sm text-text-light truncate max-w-[200px]">{payment.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.type === 'SUBSCRIPTION' ? 'bg-blue-900/30 text-blue-400' :
                          payment.type === 'PROJECT' ? 'bg-walnut/20 text-walnut' :
                          'bg-purple-900/30 text-purple-400'
                        }`}>
                          {payment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-light">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-text">{formatCurrency(payment.amount)}</p>
                        {payment.discountAmount && payment.discountAmount > 0 && (
                          <p className="text-xs text-green-400">Saved {formatCurrency(payment.discountAmount)}</p>
                        )}
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
          {/* Pricing Plans */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>💰</span> Pricing Plans
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Partner Plan */}
              <div className={`p-4 rounded-xl border ${subscription ? 'border-blue-500/50 bg-blue-900/10' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text">Partner</h3>
                  {subscription && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-text mb-1">$499<span className="text-sm text-text-light font-normal">/month</span></p>
                <p className="text-sm text-text-light">5 projects included</p>
              </div>

              {/* Basic */}
              <div className="p-4 rounded-xl border border-border">
                <h3 className="font-semibold text-text mb-2">Basic</h3>
                <p className="text-2xl font-bold text-text mb-1">$99<span className="text-sm text-text-light font-normal">/project</span></p>
                <p className="text-sm text-text-light">Standard visualization</p>
              </div>

              {/* Professional */}
              <div className="p-4 rounded-xl border border-border">
                <h3 className="font-semibold text-text mb-2">Professional</h3>
                <p className="text-2xl font-bold text-text mb-1">$199<span className="text-sm text-text-light font-normal">/project</span></p>
                <p className="text-sm text-text-light">Premium visualization</p>
              </div>
            </div>
          </div>

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
