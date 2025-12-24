// app/dashboard/layout.tsx
// Dashboard layout with sidebar navigation

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, removeAuthCookie } from '@/lib/auth'

async function signOut() {
  'use server'
  await removeAuthCookie()
  redirect('/auth/login')
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen flex bg-warm-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="/logo-icon.svg"
              alt="CabinetViz"
              className="w-9 h-9"
            />
            <span className="text-lg font-bold">CabinetViz</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="px-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Menu
            </p>
            <div className="space-y-1">
              <NavItem href="/dashboard" icon="📊" label="Dashboard" />
              <NavItem href="/dashboard/jobs" icon="📁" label="My Jobs" />
              <NavItem href="/jobs/new" icon="➕" label="New Job" />
            </div>
          </div>

          <div className="px-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Resources
            </p>
            <div className="space-y-1">
              <NavItem href="/dashboard/downloads" icon="📥" label="Downloads" />
              <NavItem href="/dashboard/messages" icon="💬" label="Messages" />
              <NavItem href="/dashboard/help" icon="❓" label="Help & Support" />
            </div>
          </div>

          <div className="px-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Account
            </p>
            <div className="space-y-1">
              <NavItem href="/dashboard/settings" icon="⚙️" label="Settings" />
              <NavItem href="/dashboard/billing" icon="💳" label="Billing" />
            </div>
          </div>

          {/* Admin Quick Access - Only show for admin/designer users */}
          {(user.role === 'ADMIN' || user.role === 'DESIGNER') && (
            <div className="px-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Admin
              </p>
              <div className="space-y-1">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/30"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="flex-1">Admin Dashboard</span>
                  <span className="text-xs">→</span>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
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
}: {
  href: string
  icon: string
  label: string
  badge?: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors group"
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  )
}
