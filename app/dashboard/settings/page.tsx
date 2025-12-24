// app/dashboard/settings/page.tsx
// Customer settings page

import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  async function updateProfile(formData: FormData) {
    'use server'
    const currentUser = await getCurrentUser()
    if (!currentUser) return

    const name = formData.get('name') as string
    const company = formData.get('company') as string
    const phone = formData.get('phone') as string

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: name.trim(),
        company: company.trim() || null,
        phone: phone.trim() || null,
      },
    })

    revalidatePath('/dashboard/settings')
  }

  return (
    <div className="p-8 bg-warm-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text-light mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>👤</span> Profile Information
              </h2>
            </div>
            <form action={updateProfile} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-dark-elevated border border-border rounded-lg text-text-muted cursor-not-allowed"
                />
                <p className="text-xs text-text-muted mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user.name}
                  required
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  defaultValue={user.company || ''}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={user.phone || ''}
                  placeholder="Optional"
                  className="w-full px-4 py-2.5 border border-border bg-dark-elevated text-text rounded-lg focus:ring-2 focus:ring-walnut focus:border-walnut"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-walnut to-accent text-white font-bold rounded-lg hover:from-walnut-dark hover:to-walnut transition-all shadow-lg"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Notification Settings */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-dark-elevated">
              <h2 className="font-bold text-text flex items-center gap-2">
                <span>🔔</span> Notification Preferences
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-text">Job Status Updates</p>
                  <p className="text-sm text-text-light">
                    Get notified when your job status changes
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-border bg-dark-elevated accent-walnut"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-text">New Deliverables</p>
                  <p className="text-sm text-text-light">
                    Get notified when files are ready to download
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-border bg-dark-elevated accent-walnut"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-text">New Comments</p>
                  <p className="text-sm text-text-light">
                    Get notified when there are new messages on your jobs
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded border-border bg-dark-elevated accent-walnut"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-text">Marketing Emails</p>
                  <p className="text-sm text-text-light">
                    Receive updates about new features and offers
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-border bg-dark-elevated accent-walnut"
                />
              </label>
              <p className="text-sm text-text-muted pt-2 border-t border-border">
                Notification preferences will be saved automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-dark-surface rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-gradient-to-r from-walnut to-accent">
              <h2 className="font-bold text-white flex items-center gap-2">
                <span>ℹ️</span> Account Info
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Account Type</span>
                <span className="font-medium text-text">Customer</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Member Since</span>
                <span className="font-medium text-text">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Last Updated</span>
                <span className="font-medium text-text">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-dark-surface rounded-2xl border border-red-900/50 overflow-hidden">
            <div className="p-5 border-b border-red-900/50 bg-red-900/20">
              <h2 className="font-bold text-red-400 flex items-center gap-2">
                <span>⚠️</span> Danger Zone
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-text-light mb-4">
                Deleting your account will permanently remove all your data including jobs, files, and messages.
              </p>
              <button
                type="button"
                className="w-full py-2 border border-red-800 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
