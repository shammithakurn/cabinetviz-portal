// app/admin/settings/page.tsx
// Admin settings page

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DESIGNER')) {
    redirect('/auth/login')
  }

  // Only admins can access settings
  const isAdmin = user.role === 'ADMIN'

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text-light mt-1">Manage your admin panel preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>👤</span> Your Profile
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Name</label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-4 py-2.5 bg-dark-elevated border border-border rounded-lg text-text-muted cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-dark-elevated border border-border rounded-lg text-text-muted cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Role</label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="w-full px-4 py-2.5 bg-dark-elevated border border-border rounded-lg text-text-muted cursor-not-allowed"
                />
              </div>
              <p className="text-sm text-text-muted">
                Profile changes are currently disabled. Contact your system administrator.
              </p>
            </div>
          </div>

          {/* Business Settings - Admin Only */}
          {isAdmin && (
            <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border bg-dark-elevated">
                <h2 className="font-bold text-text flex items-center gap-2">
                  <span>🏢</span> Business Settings
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Business Name</label>
                  <input
                    type="text"
                    defaultValue="CabinetViz"
                    disabled
                    className="w-full px-4 py-2.5 bg-dark-elevated border border-border rounded-lg text-text-muted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="hello@cabinetviz.com"
                    disabled
                    className="w-full px-4 py-2.5 bg-dark-elevated border border-border rounded-lg text-text-muted cursor-not-allowed"
                  />
                </div>
                <p className="text-sm text-text-muted">
                  Business settings are managed in the environment configuration.
                </p>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>🔔</span> Notification Preferences
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-text">New Job Notifications</p>
                  <p className="text-sm text-text-light">Get notified when a new job is submitted</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border bg-dark-elevated accent-walnut" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-text">New Comments</p>
                  <p className="text-sm text-text-light">Get notified when customers add comments</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-border bg-dark-elevated accent-walnut" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-text">Weekly Reports</p>
                  <p className="text-sm text-text-light">Receive weekly business summary emails</p>
                </div>
                <input type="checkbox" className="w-5 h-5 rounded border-border bg-dark-elevated accent-walnut" />
              </label>
              <p className="text-sm text-text-muted pt-2 border-t border-border">
                Notification settings will be saved automatically when implemented.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-gradient-to-r from-walnut to-accent">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span>ℹ️</span> System Info
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Version</span>
                <span className="font-medium text-text">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Database</span>
                <span className="font-medium text-text">SQLite</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Framework</span>
                <span className="font-medium text-text">Next.js 14</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Environment</span>
                <span className="font-medium text-green-400">Development</span>
              </div>
            </div>
          </div>

          {/* Pricing Packages */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>💰</span> Pricing Packages
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="p-3 bg-dark-elevated rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text">Basic</span>
                  <span className="text-walnut font-bold">$99</span>
                </div>
                <p className="text-xs text-text-muted mt-1">3D renders only</p>
              </div>
              <div className="p-3 bg-walnut/10 rounded-lg border border-walnut/30">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text">Professional</span>
                  <span className="text-walnut font-bold">$149</span>
                </div>
                <p className="text-xs text-text-muted mt-1">3D + 2D drawings</p>
              </div>
              <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text">Partner</span>
                  <span className="text-purple-400 font-bold">Custom</span>
                </div>
                <p className="text-xs text-text-muted mt-1">Unlimited jobs</p>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="bg-dark-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>❓</span> Help & Support
              </h2>
            </div>
            <div className="p-5 space-y-2">
              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">📖</span>
                <span className="font-medium text-text">Documentation</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">💬</span>
                <span className="font-medium text-text">Contact Support</span>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-dark-elevated transition-colors"
              >
                <span className="text-xl">🐛</span>
                <span className="font-medium text-text">Report an Issue</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
