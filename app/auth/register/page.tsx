// app/auth/register/page.tsx
// Registration page

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-warm-white">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-elevated to-dark-surface items-center justify-center p-12 border-r border-border">
        <div className="max-w-md text-center">
          <div className="text-8xl mb-8">📐</div>
          <h2 className="text-2xl font-bold text-text mb-4">
            Professional Cabinet Visualization
          </h2>
          <p className="text-text-light">
            Join hundreds of tradespeople who use our platform to
            manage their 3D design projects efficiently.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="bg-walnut/10 rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-walnut">500+</div>
              <div className="text-text-muted text-sm">Projects</div>
            </div>
            <div className="bg-walnut/10 rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-walnut">48hr</div>
              <div className="text-text-muted text-sm">Turnaround</div>
            </div>
            <div className="bg-walnut/10 rounded-xl p-4 border border-border">
              <div className="text-2xl font-bold text-walnut">97%</div>
              <div className="text-text-muted text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
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

          <h1 className="text-2xl font-bold text-text mb-2">Create your account</h1>
          <p className="text-text-light mb-8">Start managing your design projects today</p>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="label">
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="company" className="label">
                  Company
                </label>
                <input
                  id="company"
                  type="text"
                  className="input"
                  placeholder="Smith Joinery"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="john@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="label">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="input"
                placeholder="+64 21 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="label">
                  Password *
                </label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 rounded border-border bg-dark-elevated text-walnut focus:ring-walnut"
                required
              />
              <label htmlFor="terms" className="text-sm text-text-light">
                I agree to the{' '}
                <Link href="/terms" className="text-walnut hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-walnut hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3 mt-6"
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-text-light mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-walnut font-semibold hover:text-accent">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
