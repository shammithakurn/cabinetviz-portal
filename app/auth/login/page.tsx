// app/auth/login/page.tsx
// Login page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Redirect based on user role
      if (data.user.role === 'ADMIN' || data.user.role === 'DESIGNER') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-warm-white">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-light hover:text-walnut mb-8 transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-walnut rounded-xl flex items-center justify-center text-warm-white text-xl">
              ⬡
            </div>
            <span className="text-xl font-bold text-text">CabinetViz</span>
          </Link>

          <h1 className="text-2xl font-bold text-text mb-2">Welcome back</h1>
          <p className="text-text-light mb-8">Sign in to access your dashboard</p>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label mb-0">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-text-light mt-8">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-walnut font-semibold hover:text-accent">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-elevated to-dark-surface items-center justify-center p-12 border-l border-border">
        <div className="max-w-md text-center">
          <div className="text-8xl mb-8">🏠</div>
          <h2 className="text-2xl font-bold text-text mb-4">
            Your Design Hub
          </h2>
          <p className="text-text-light">
            Track your cabinet projects, upload files, and download your
            professional 3D renders and technical drawings.
          </p>
        </div>
      </div>
    </div>
  )
}
