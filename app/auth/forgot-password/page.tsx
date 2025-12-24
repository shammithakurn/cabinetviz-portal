// app/auth/forgot-password/page.tsx
// Forgot password page

'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-warm-white">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Back to Login */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-text-light hover:text-walnut mb-8 transition-colors"
          >
            <span>←</span>
            <span>Back to Login</span>
          </Link>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-walnut rounded-xl flex items-center justify-center text-warm-white text-xl">
              ⬡
            </div>
            <span className="text-xl font-bold text-text">CabinetViz</span>
          </Link>

          {isSubmitted ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                ✅
              </div>
              <h1 className="text-2xl font-bold text-text mb-2">Check your email</h1>
              <p className="text-text-light mb-8">
                We've sent password reset instructions to <span className="font-medium text-text">{email}</span>
              </p>
              <p className="text-sm text-text-muted mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                  className="btn btn-primary w-full py-3"
                >
                  Try Again
                </button>
                <Link
                  href="/auth/login"
                  className="block w-full py-3 border border-border text-text rounded-lg hover:bg-dark-elevated transition-colors text-center"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-text mb-2">Forgot your password?</h1>
              <p className="text-text-light mb-8">
                No worries! Enter your email and we'll send you reset instructions.
              </p>

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>
              </form>

              <p className="text-center text-text-light mt-8">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-walnut font-semibold hover:text-accent">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-dark-elevated to-dark-surface items-center justify-center p-12 border-l border-border">
        <div className="max-w-md text-center">
          <div className="text-8xl mb-8">🔐</div>
          <h2 className="text-2xl font-bold text-text mb-4">
            Password Recovery
          </h2>
          <p className="text-text-light">
            Don't worry, it happens to the best of us. We'll help you get back
            into your account in no time.
          </p>
        </div>
      </div>
    </div>
  )
}
