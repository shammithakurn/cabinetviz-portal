'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Discount {
  id: string
  code: string
  name: string
  description: string | null
  type: string
  value: number
  scope: string
  applicablePlans: string | null
  userId: string | null
  maxUses: number | null
  maxUsesPerUser: number
  usedCount: number
  minOrderValue: number | null
  isActive: boolean
  startDate: string
  endDate: string | null
  createdAt: string
}

interface SiteDiscount {
  id: string
  name: string
  type: string
  value: number
  bannerText: string | null
  bannerColor: string | null
  appliesTo: string
  isActive: boolean
  startDate: string
  endDate: string
  createdAt: string
}

// Check if a discount is currently live on the homepage
function isDiscountLive(discount: SiteDiscount): boolean {
  if (!discount.isActive) return false
  const now = new Date()
  const start = new Date(discount.startDate)
  const end = new Date(discount.endDate)
  return now >= start && now <= end
}

export default function AdminDiscountsPage() {
  const [activeTab, setActiveTab] = useState<'promo' | 'site'>('promo')
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [siteDiscounts, setSiteDiscounts] = useState<SiteDiscount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: 10,
    scope: 'ALL',
    applicablePlans: '',
    maxUses: '',
    minOrderValue: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    bannerText: '',
    bannerColor: '#EF4444',
    appliesTo: 'ALL',
    isActive: true
  })

  const fetchDiscounts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/discounts?type=${activeTab}`)
      const data = await res.json()

      if (res.ok) {
        if (activeTab === 'promo') {
          setDiscounts(data.discounts)
        } else {
          setSiteDiscounts(data.discounts)
        }
      }
    } catch (error) {
      console.error('Error fetching discounts:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchDiscounts()
  }, [fetchDiscounts])

  const handleCreate = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter a name for the discount')
      return
    }
    if (formData.value <= 0) {
      alert('Please enter a valid discount value')
      return
    }
    if (activeTab === 'promo' && !formData.code.trim()) {
      alert('Please enter a promo code')
      return
    }
    if (activeTab === 'site' && !formData.endDate) {
      alert('Please enter an end date for the site-wide sale')
      return
    }

    try {
      const payload: Record<string, unknown> = {
        discountType: activeTab,
        name: formData.name.trim(),
        type: formData.type,
        value: formData.value,
        isActive: formData.isActive,
        startDate: formData.startDate
      }

      if (activeTab === 'promo') {
        payload.code = formData.code.toUpperCase().trim()
        payload.description = formData.description || null
        payload.scope = formData.scope
        payload.applicablePlans = formData.applicablePlans || null
        payload.maxUses = formData.maxUses ? parseInt(formData.maxUses) : null
        payload.minOrderValue = formData.minOrderValue ? parseFloat(formData.minOrderValue) : null
        payload.endDate = formData.endDate || null
      } else {
        payload.bannerText = formData.bannerText || null
        payload.bannerColor = formData.bannerColor
        payload.appliesTo = formData.appliesTo
        payload.endDate = formData.endDate
      }

      let res
      if (editingId) {
        // Update existing discount
        res = await fetch(`/api/admin/discounts/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        // Create new discount
        res = await fetch('/api/admin/discounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const data = await res.json()

      if (res.ok) {
        fetchDiscounts()
        setShowCreateModal(false)
        setEditingId(null)
        resetForm()
      } else {
        alert(data.error || 'Failed to save discount')
      }
    } catch (error) {
      console.error('Error saving discount:', error)
      alert('Failed to save discount. Please try again.')
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await fetch(`/api/admin/discounts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discountType: activeTab,
          isActive: !currentActive
        })
      })
      fetchDiscounts()
    } catch (error) {
      console.error('Error toggling discount:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return

    try {
      await fetch(`/api/admin/discounts/${id}?type=${activeTab}`, {
        method: 'DELETE'
      })
      fetchDiscounts()
    } catch (error) {
      console.error('Error deleting discount:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 10,
      scope: 'ALL',
      applicablePlans: '',
      maxUses: '',
      minOrderValue: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      bannerText: '',
      bannerColor: '#EF4444',
      appliesTo: 'ALL',
      isActive: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatValue = (type: string, value: number) => {
    if (type === 'PERCENTAGE') return `${value}%`
    return `$${value.toFixed(2)}`
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
            <h1 className="text-3xl font-display font-bold text-charcoal">Discount Management</h1>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowCreateModal(true)
            }}
            className="px-6 py-3 bg-walnut text-white rounded-xl font-medium hover:bg-walnut-dark transition-colors"
          >
            + Create Discount
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-2 shadow-sm mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('promo')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'promo'
                ? 'bg-walnut text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Promo Codes
          </button>
          <button
            onClick={() => setActiveTab('site')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'site'
                ? 'bg-walnut text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Site-wide Sales
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : activeTab === 'promo' ? (
          /* Promo Codes Table */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-charcoal">Code</th>
                  <th className="text-left p-4 font-semibold text-charcoal">Name</th>
                  <th className="text-left p-4 font-semibold text-charcoal">Discount</th>
                  <th className="text-left p-4 font-semibold text-charcoal">Usage</th>
                  <th className="text-left p-4 font-semibold text-charcoal">Valid Until</th>
                  <th className="text-left p-4 font-semibold text-charcoal">Status</th>
                  <th className="text-left p-4 font-semibold text-charcoal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-light">
                      No promo codes found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  discounts.map(discount => (
                    <tr key={discount.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm">
                          {discount.code}
                        </code>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-charcoal">{discount.name}</p>
                          {discount.description && (
                            <p className="text-sm text-text-light">{discount.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-walnut">
                          {formatValue(discount.type, discount.value)} off
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{discount.usedCount} uses</p>
                          {discount.maxUses && (
                            <p className="text-xs text-text-light">Max: {discount.maxUses}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {discount.endDate ? formatDate(discount.endDate) : 'No expiry'}
                        </p>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(discount.id, discount.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            discount.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Site-wide Sales Section */
          <div className="space-y-6">
            {/* Live Banner Indicator */}
            {siteDiscounts.some(d => isDiscountLive(d)) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">🎉</span>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Discount Banner Live on Homepage!</p>
                    <p className="text-sm text-green-600">
                      {siteDiscounts.find(d => isDiscountLive(d))?.name} is currently showing to all visitors.
                    </p>
                  </div>
                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    View on Site
                  </a>
                </div>
              </div>
            )}

            {/* Site-wide Sales Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-charcoal">Sale Name</th>
                    <th className="text-left p-4 font-semibold text-charcoal">Discount</th>
                    <th className="text-left p-4 font-semibold text-charcoal">Banner Preview</th>
                    <th className="text-left p-4 font-semibold text-charcoal">Period</th>
                    <th className="text-left p-4 font-semibold text-charcoal">Homepage</th>
                    <th className="text-left p-4 font-semibold text-charcoal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {siteDiscounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-light">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-4xl">🏷️</span>
                          <p>No site-wide sales found.</p>
                          <p className="text-sm">Create a sale to display a promotional banner on your homepage.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    siteDiscounts.map(discount => {
                      const isLive = isDiscountLive(discount)
                      return (
                        <tr key={discount.id} className={`border-b hover:bg-gray-50 ${isLive ? 'bg-green-50/50' : ''}`}>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-charcoal">{discount.name}</p>
                              {isLive && (
                                <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full animate-pulse">
                                  LIVE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-walnut">
                              {formatValue(discount.type, discount.value)} off
                            </span>
                          </td>
                          <td className="p-4">
                            {discount.bannerText ? (
                              <div
                                className="px-3 py-1.5 rounded text-white text-sm inline-flex items-center gap-2 max-w-[250px]"
                                style={{ backgroundColor: discount.bannerColor || '#EF4444' }}
                              >
                                <span className="truncate">{discount.bannerText}</span>
                              </div>
                            ) : (
                              <span className="text-text-light text-sm italic">Auto-generated</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm font-medium">
                                {formatDate(discount.startDate)} - {formatDate(discount.endDate)}
                              </p>
                              {new Date(discount.endDate) < new Date() && (
                                <span className="text-xs text-red-500">Expired</span>
                              )}
                              {new Date(discount.startDate) > new Date() && (
                                <span className="text-xs text-amber-500">Scheduled</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleToggleActive(discount.id, discount.isActive)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                discount.isActive
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {discount.isActive ? 'Showing' : 'Hidden'}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(discount.id)
                                  setFormData({
                                    ...formData,
                                    name: discount.name,
                                    type: discount.type,
                                    value: discount.value,
                                    bannerText: discount.bannerText || '',
                                    bannerColor: discount.bannerColor || '#EF4444',
                                    appliesTo: discount.appliesTo,
                                    startDate: discount.startDate.split('T')[0],
                                    endDate: discount.endDate.split('T')[0],
                                    isActive: discount.isActive,
                                  })
                                  setShowCreateModal(true)
                                }}
                                className="text-walnut hover:text-walnut-dark text-sm font-medium"
                              >
                                Edit
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleDelete(discount.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-charcoal">
                  {editingId ? 'Edit' : 'Create'} {activeTab === 'promo' ? 'Promo Code' : 'Site-wide Sale'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Promo Code field - only for promo codes */}
                {activeTab === 'promo' && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Promo Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                      placeholder="e.g., SUMMER20"
                      required
                    />
                  </div>
                )}

                {/* Name field - for both promo and site discounts */}
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1">
                    {activeTab === 'site' ? 'Sale Name *' : 'Name *'}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                    placeholder={activeTab === 'site' ? 'e.g., Christmas Sale' : 'e.g., Summer Sale'}
                    required
                  />
                </div>

                {/* Description - only for promo codes */}
                {activeTab === 'promo' && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                      rows={2}
                      placeholder="Optional description"
                    />
                  </div>
                )}

                {/* Type and Value - for both promo and site discounts */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Discount Type *</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                    >
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED_AMOUNT">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      Value {formData.type === 'PERCENTAGE' ? '(%)' : '($)'} *
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                      min="0"
                      max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                      required
                    />
                  </div>
                </div>

                {/* Max Uses - only for promo codes */}
                {activeTab === 'promo' && (
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Max Uses (optional)</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                      placeholder="Leave empty for unlimited"
                      min="0"
                    />
                  </div>
                )}

                {/* Site discount specific fields */}
                {activeTab === 'site' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Banner Text</label>
                      <input
                        type="text"
                        value={formData.bannerText}
                        onChange={e => setFormData({ ...formData, bannerText: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                        placeholder="e.g., Summer Sale - 20% Off!"
                      />
                      <p className="text-xs text-text-light mt-1">
                        Leave empty to auto-generate from sale name and discount
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-1">Banner Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.bannerColor}
                          onChange={e => setFormData({ ...formData, bannerColor: e.target.value })}
                          className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <span className="text-sm text-text-light">{formData.bannerColor}</span>
                        {/* Quick color presets */}
                        <div className="flex gap-1">
                          {['#EF4444', '#B87333', '#059669', '#7C3AED', '#EC4899'].map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, bannerColor: color })}
                              className={`w-6 h-6 rounded-full border-2 ${formData.bannerColor === color ? 'border-gray-800' : 'border-transparent'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Banner Preview */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Banner Preview</label>
                      <div
                        className="rounded-lg overflow-hidden text-white text-center py-3 px-4 font-semibold text-sm"
                        style={{ backgroundColor: formData.bannerColor }}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <span>🎉</span>
                          <span>
                            {formData.bannerText || `${formData.name || 'Sale'} - ${formData.type === 'PERCENTAGE' ? `${formData.value}% OFF` : `$${formData.value} OFF`}`}
                          </span>
                          <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                            {formData.type === 'PERCENTAGE' ? `${formData.value}%` : `$${formData.value}`} OFF
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-text-light mt-1 text-center">
                        This is how the banner will appear at the top of your homepage
                      </p>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal mb-1">
                      End Date {activeTab === 'promo' && '(optional)'}
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-walnut focus:border-transparent"
                      required={activeTab === 'site'}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-walnut focus:ring-walnut"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-charcoal">
                    Active immediately
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-walnut text-white rounded-lg font-medium hover:bg-walnut-dark"
                >
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
