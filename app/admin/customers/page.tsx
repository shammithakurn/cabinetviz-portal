// app/admin/customers/page.tsx
// Admin page listing all customers with search and stats

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface Props {
  searchParams: { search?: string }
}

export default async function CustomersPage({ searchParams }: Props) {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
    redirect('/auth/login')
  }

  const search = searchParams.search || ''

  // Fetch all customers with their job counts and stats
  const customers = await prisma.user.findMany({
    where: {
      role: 'CUSTOMER',
      OR: search
        ? [
            { name: { contains: search } },
            { email: { contains: search } },
            { company: { contains: search } },
          ]
        : undefined,
    },
    include: {
      jobs: {
        select: {
          id: true,
          status: true,
          quotedPrice: true,
        },
      },
      _count: {
        select: { jobs: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate stats for each customer
  const customersWithStats = customers.map((customer) => {
    const totalJobs = customer.jobs.length
    const completedJobs = customer.jobs.filter((j) => j.status === 'COMPLETED').length
    const activeJobs = customer.jobs.filter((j) =>
      ['PENDING', 'QUOTED', 'IN_PROGRESS', 'REVIEW', 'REVISION'].includes(j.status)
    ).length
    const totalSpent = customer.jobs
      .filter((j) => j.status === 'COMPLETED' && j.quotedPrice)
      .reduce((sum, j) => sum + (j.quotedPrice || 0), 0)

    return {
      ...customer,
      totalJobs,
      completedJobs,
      activeJobs,
      totalSpent,
    }
  })

  // Overall stats
  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) =>
    c.jobs.some((j) => ['PENDING', 'QUOTED', 'IN_PROGRESS', 'REVIEW', 'REVISION'].includes(j.status))
  ).length
  const totalRevenue = customersWithStats.reduce((sum, c) => sum + c.totalSpent, 0)

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Customer Management</h1>
        <p className="text-text-light mt-1">View and manage all customer accounts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dark-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900/30 rounded-lg flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{totalCustomers}</p>
              <p className="text-xs text-text-light">Total Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <p className="text-2xl font-bold text-text">{activeCustomers}</p>
              <p className="text-xs text-text-light">Active Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center text-xl">
              📊
            </div>
            <div>
              <p className="text-2xl font-bold text-text">
                {customers.reduce((sum, c) => sum + c._count.jobs, 0)}
              </p>
              <p className="text-xs text-text-light">Total Jobs</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-surface rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-900/30 rounded-lg flex items-center justify-center text-xl">
              💰
            </div>
            <div>
              <p className="text-2xl font-bold text-text">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-text-light">Total Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form className="flex gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">🔍</span>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name, email, or company..."
              className="w-full pl-10 pr-4 py-2.5 border border-border bg-dark-surface text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-walnut text-white font-medium rounded-lg hover:bg-walnut-dark transition-colors"
          >
            Search
          </button>
          {search && (
            <Link
              href="/admin/customers"
              className="px-6 py-2.5 border border-border text-text-light font-medium rounded-lg hover:bg-dark-elevated transition-colors"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Customers Table */}
      <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-elevated">
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Customer
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Contact
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Jobs
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Active
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Total Spent
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-text-light uppercase">
                  Joined
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customersWithStats.map((customer) => (
                <tr key={customer.id} className="hover:bg-dark-elevated transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-walnut to-accent rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{customer.name}</p>
                        <p className="text-sm text-text-light">{customer.company || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-walnut hover:text-accent text-sm"
                      >
                        {customer.email}
                      </a>
                      <p className="text-sm text-text-light">{customer.phone || '—'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-dark-elevated rounded-full text-sm font-semibold text-text">
                      {customer.totalJobs}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {customer.activeJobs > 0 ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-green-900/30 rounded-full text-sm font-semibold text-green-400">
                        {customer.activeJobs}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-text">
                      ${customer.totalSpent.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-light">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="px-3 py-1.5 text-walnut hover:bg-walnut/20 rounded-lg text-sm font-medium transition-colors"
                      >
                        View
                      </Link>
                      <a
                        href={`mailto:${customer.email}`}
                        className="px-3 py-1.5 text-text-light hover:bg-dark-elevated rounded-lg text-sm font-medium transition-colors"
                        title="Email customer"
                      >
                        📧
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {customersWithStats.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-light">
                    {search ? (
                      <>
                        No customers found matching &ldquo;{search}&rdquo;
                        <br />
                        <Link href="/admin/customers" className="text-walnut hover:text-accent mt-2 inline-block">
                          Clear search
                        </Link>
                      </>
                    ) : (
                      'No customers yet'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-900/30 rounded-full"></span>
          <span>Active = has jobs in progress</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-dark-elevated rounded-full"></span>
          <span>Total Spent = completed job quotes</span>
        </div>
      </div>
    </div>
  )
}
