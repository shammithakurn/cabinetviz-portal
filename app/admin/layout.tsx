// app/admin/layout.tsx
// Admin dashboard layout with sidebar navigation and dynamic counts

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, removeAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function signOut() {
  'use server'
  await removeAuthCookie()
  redirect('/auth/login')
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  // Check if user is admin or designer
  if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
    redirect('/auth/login')
  }

  // Fetch dynamic counts for sidebar badges
  const [pendingCount, reviewCount, unreadComments] = await Promise.all([
    prisma.job.count({ where: { status: 'PENDING' } }),
    prisma.job.count({ where: { status: 'REVIEW' } }),
    prisma.comment.count({
      where: {
        authorRole: 'CUSTOMER',
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      },
    }),
  ])

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen flex bg-warm-white">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <img
              src="/logo-icon.svg"
              alt="CabinetViz"
              className="w-9 h-9"
            />
            <div>
              <span className="text-lg font-bold">CabinetViz</span>
              <span className="text-xs text-red-400 ml-2">ADMIN</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="px-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Overview
            </p>
            <div className="space-y-1">
              <NavItem href="/admin" icon="📊" label="Dashboard" />
              <NavItem href="/admin/jobs" icon="📁" label="All Jobs" />
              <NavItem href="/admin/customers" icon="👥" label="Customers" />
            </div>
          </div>

          <div className="px-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Job Management
            </p>
            <div className="space-y-1">
              <NavItem
                href="/admin/jobs?status=PENDING"
                icon="⏳"
                label="Pending"
                badge={pendingCount > 0 ? pendingCount.toString() : undefined}
                badgeColor="amber"
              />
              <NavItem href="/admin/jobs?status=IN_PROGRESS" icon="🔨" label="In Progress" />
              <NavItem
                href="/admin/jobs?status=REVIEW"
                icon="👀"
                label="Ready for Review"
                badge={reviewCount > 0 ? reviewCount.toString() : undefined}
                badgeColor="orange"
              />
              <NavItem href="/admin/jobs?status=COMPLETED" icon="✅" label="Completed" />
            </div>
          </div>

          <div className="px-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Tools
            </p>
            <div className="space-y-1">
              <NavItem href="/admin/reports" icon="📈" label="Reports" />
              <NavItem href="/admin/theme" icon="🎨" label="Theme Settings" />
            </div>
          </div>

          <div className="px-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              System
            </p>
            <div className="space-y-1">
              <NavItem href="/admin/settings" icon="⚙️" label="Settings" />
              <NavItem href="/dashboard" icon="👤" label="Customer View" />
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 bg-gray-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-red-400 capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}

function NavItem({
  href,
  icon,
  label,
  badge,
  badgeColor = 'amber',
}: {
  href: string
  icon: string
  label: string
  badge?: string
  badgeColor?: 'amber' | 'red' | 'green' | 'orange'
}) {
  const badgeColors = {
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors group"
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={`${badgeColors[badgeColor]} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
          {badge}
        </span>
      )}
    </Link>
  )
}
