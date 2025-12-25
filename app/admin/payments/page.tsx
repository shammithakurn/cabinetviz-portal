'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Payment {
  id: string
  amount: number
  originalAmount: number | null
  discountAmount: number | null
  discountCode: string | null
  currency: string
  status: string
  type: string
  description: string
  jobId: string | null
  subscriptionMonth: string | null
  invoiceNumber: string | null
  invoiceSentAt: string | null
  paidAt: string | null
  paymentMethod: string | null
  notes: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    company: string | null
  }
}

interface Stats {
  totalRevenue: number
  pendingAmount: number
  thisMonthRevenue: number
  totalPayments: number
  pendingPayments: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (typeFilter !== 'all') params.append('type', typeFilter)

      const res = await fetch(`/api/admin/payments?${params}`)
      const data = await res.json()

      if (res.ok) {
        setPayments(data.payments)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleAction = async (id: string, action: string, extraData?: Record<string, string>) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extraData })
      })

      if (res.ok) {
        fetchPayments()
        setShowModal(false)
        setSelectedPayment(null)
      }
    } catch (error) {
      console.error('Error performing action:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SUBSCRIPTION': return 'bg-blue-100 text-blue-800'
      case 'PROJECT': return 'bg-walnut/10 text-walnut'
      case 'ONE_TIME': return 'bg-purple-100 text-purple-800'
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
            <div className="grid grid-cols-5 gap-4 mb-8">
              {[1, 2, 3, 4, 5].map(i => (
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
            <h1 className="text-3xl font-display font-bold text-charcoal">Payment Management</h1>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">This Month</p>
              <p className="text-2xl font-bold text-walnut">{formatCurrency(stats.thisMonthRevenue)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Total Payments</p>
              <p className="text-2xl font-bold text-charcoal">{stats.totalPayments}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-text-light text-sm">Pending Count</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-text-light">Status:</span>
              {['all', 'PENDING', 'PAID', 'OVERDUE', 'REFUNDED'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-walnut text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-light">Type:</span>
              {['all', 'SUBSCRIPTION', 'PROJECT', 'ONE_TIME'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-walnut text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-charcoal">Invoice</th>
                <th className="text-left p-4 font-semibold text-charcoal">Customer</th>
                <th className="text-left p-4 font-semibold text-charcoal">Amount</th>
                <th className="text-left p-4 font-semibold text-charcoal">Type</th>
                <th className="text-left p-4 font-semibold text-charcoal">Status</th>
                <th className="text-left p-4 font-semibold text-charcoal">Date</th>
                <th className="text-left p-4 font-semibold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-text-light">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-charcoal">{payment.invoiceNumber || '-'}</p>
                        <p className="text-sm text-text-light truncate max-w-[200px]">{payment.description}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-charcoal">{payment.user.name}</p>
                        <p className="text-sm text-text-light">{payment.user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-charcoal">{formatCurrency(payment.amount)}</p>
                        {payment.discountAmount && payment.discountAmount > 0 && (
                          <p className="text-xs text-green-600">
                            -{formatCurrency(payment.discountAmount)} ({payment.discountCode})
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(payment.type)}`}>
                        {payment.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{formatDate(payment.createdAt)}</p>
                      {payment.paidAt && (
                        <p className="text-xs text-green-600">Paid: {formatDate(payment.paidAt)}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment)
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
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-charcoal">Payment Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedPayment(null)
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
                  <p className="text-sm text-text-light">Invoice Number</p>
                  <p className="font-medium text-lg">{selectedPayment.invoiceNumber || 'Not assigned'}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-text-light">Customer</p>
                  <p className="font-medium">{selectedPayment.user.name}</p>
                  <p className="text-sm text-text-light">{selectedPayment.user.email}</p>
                  {selectedPayment.user.company && (
                    <p className="text-sm text-text-light">{selectedPayment.user.company}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Amount</p>
                    <p className="font-medium text-xl text-walnut">{formatCurrency(selectedPayment.amount)}</p>
                    {selectedPayment.originalAmount && (
                      <p className="text-sm text-text-light line-through">
                        {formatCurrency(selectedPayment.originalAmount)}
                      </p>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPayment.status)}`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                </div>

                {selectedPayment.discountCode && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-800">Discount Applied</p>
                    <p className="font-medium text-green-800">
                      {selectedPayment.discountCode} - {formatCurrency(selectedPayment.discountAmount || 0)} off
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-text-light">Description</p>
                  <p className="font-medium">{selectedPayment.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Type</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedPayment.type)}`}>
                      {selectedPayment.type}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Created</p>
                    <p className="font-medium">{formatDate(selectedPayment.createdAt)}</p>
                  </div>
                </div>

                {selectedPayment.paidAt && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-800">Paid On</p>
                    <p className="font-medium text-green-800">{formatDate(selectedPayment.paidAt)}</p>
                    {selectedPayment.paymentMethod && (
                      <p className="text-sm text-green-700">via {selectedPayment.paymentMethod}</p>
                    )}
                  </div>
                )}

                {selectedPayment.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-text-light">Notes</p>
                    <p className="text-sm">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-charcoal">Quick Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  {selectedPayment.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleAction(selectedPayment.id, 'mark-paid', { paymentMethod: 'BANK_TRANSFER' })}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark as Paid
                      </button>
                      <button
                        onClick={() => handleAction(selectedPayment.id, 'send-invoice')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50"
                      >
                        Send Invoice
                      </button>
                      <button
                        onClick={() => handleAction(selectedPayment.id, 'cancel')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {selectedPayment.status === 'PAID' && (
                    <button
                      onClick={() => handleAction(selectedPayment.id, 'mark-refunded')}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium hover:bg-purple-200 disabled:opacity-50"
                    >
                      Mark as Refunded
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
