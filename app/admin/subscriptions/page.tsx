'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Subscription {
  id: string
  plan: string
  status: string
  billingCycle: string
  pricePerCycle: number
  startDate: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelledAt: string | null
  projectsUsedThisMonth: number
  projectsLimit: number
  lastResetDate: string
  notes: string | null
  user: {
    id: string
    name: string
    email: string
    company: string | null
  }
}

interface Stats {
  totalSubscriptions: number
  activeSubscriptions: number
  pausedSubscriptions: number
  cancelledSubscriptions: number
  monthlyRevenue: number
  yearlyRevenue: number
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptions()
  }, [statusFilter])

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`/api/admin/subscriptions?${params}`)
      const data = await res.json()

      if (res.ok) {
        setSubscriptions(data.subscriptions)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: string) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (res.ok) {
        fetchSubscriptions()
        setShowModal(false)
        setSelectedSubscription(null)
      }
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'EXPIRED': return 'bg-gray-100 text-gray-800'
      case 'PENDING': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cream p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-walnut hover:text-walnut-dark text-sm mb-2 inline-block">
              ← Back to Admin
            </Link>
            <h1 className="text-3xl font-display font-bold text-charcoal">Subscription Management</h1>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Total</p>
              <p className="text-2xl font-bold text-charcoal">{stats.totalSubscriptions}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Paused</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pausedSubscriptions}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelledSubscriptions}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Monthly Revenue</p>
              <p className="text-2xl font-bold text-walnut">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Yearly Revenue</p>
              <p className="text-2xl font-bold text-walnut">{formatCurrency(stats.yearlyRevenue)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <span className="text-text-light">Filter by status:</span>
            {['all', 'ACTIVE', 'PAUSED', 'CANCELLED', 'PENDING'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-walnut text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-charcoal">Customer</th>
                <th className="text-left p-4 font-semibold text-charcoal">Plan</th>
                <th className="text-left p-4 font-semibold text-charcoal">Status</th>
                <th className="text-left p-4 font-semibold text-charcoal">Usage</th>
                <th className="text-left p-4 font-semibold text-charcoal">Billing</th>
                <th className="text-left p-4 font-semibold text-charcoal">Period End</th>
                <th className="text-left p-4 font-semibold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-light">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map(subscription => (
                  <tr key={subscription.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-charcoal">{subscription.user.name}</p>
                        <p className="text-sm text-text-light">{subscription.user.email}</p>
                        {subscription.user.company && (
                          <p className="text-xs text-text-light">{subscription.user.company}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-walnut">{subscription.plan}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-walnut h-2 rounded-full"
                            style={{ width: `${(subscription.projectsUsedThisMonth / subscription.projectsLimit) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-text-light">
                          {subscription.projectsUsedThisMonth}/{subscription.projectsLimit}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{formatCurrency(subscription.pricePerCycle)}</p>
                        <p className="text-xs text-text-light">/{subscription.billingCycle.toLowerCase()}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{formatDate(subscription.currentPeriodEnd)}</p>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedSubscription(subscription)
                          setShowModal(true)
                        }}
                        className="text-walnut hover:text-walnut-dark font-medium text-sm"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Management Modal */}
        {showModal && selectedSubscription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-charcoal">Manage Subscription</h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedSubscription(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-text-light">Customer</p>
                  <p className="font-medium">{selectedSubscription.user.name}</p>
                  <p className="text-sm text-text-light">{selectedSubscription.user.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Plan</p>
                    <p className="font-medium text-walnut">{selectedSubscription.plan}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubscription.status)}`}>
                      {selectedSubscription.status}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-text-light mb-2">Usage This Month</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-walnut h-3 rounded-full"
                        style={{ width: `${(selectedSubscription.projectsUsedThisMonth / selectedSubscription.projectsLimit) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">
                      {selectedSubscription.projectsUsedThisMonth} / {selectedSubscription.projectsLimit} projects
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Period Start</p>
                    <p className="font-medium">{formatDate(selectedSubscription.currentPeriodStart)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Period End</p>
                    <p className="font-medium">{formatDate(selectedSubscription.currentPeriodEnd)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-charcoal">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  {selectedSubscription.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAction(selectedSubscription.id, 'pause')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 disabled:opacity-50"
                    >
                      Pause Subscription
                    </button>
                  )}
                  {selectedSubscription.status === 'PAUSED' && (
                    <button
                      onClick={() => handleAction(selectedSubscription.id, 'resume')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 disabled:opacity-50"
                    >
                      Resume Subscription
                    </button>
                  )}
                  {selectedSubscription.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleAction(selectedSubscription.id, 'cancel')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50"
                    >
                      Cancel Subscription
                    </button>
                  )}
                  {(selectedSubscription.status === 'CANCELLED' || selectedSubscription.status === 'EXPIRED') && (
                    <button
                      onClick={() => handleAction(selectedSubscription.id, 'renew')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-walnut text-white rounded-lg font-medium hover:bg-walnut-dark disabled:opacity-50"
                    >
                      Renew Subscription
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(selectedSubscription.id, 'reset-usage')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50"
                  >
                    Reset Usage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
