// app/auth/login/page.tsx
// Login page with email/password and Google OAuth

'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  // Support both 'callbackUrl' (NextAuth standard) and 'redirect' (custom)
  const callbackUrl = searchParams.get('callbackUrl') || searchParams.get('redirect') || '/dashboard'
  const error = searchParams.get('error')

  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Map NextAuth error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'OAuthSignin':
        return 'Error starting Google sign in. Please try again.'
      case 'OAuthCallback':
        return 'Error during Google sign in. Please try again.'
      case 'OAuthAccountNotLinked':
        return 'This email is already registered. Please sign in with your password first, then link your Google account.'
      case 'CredentialsSignin':
        return 'Invalid email or password.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return errorCode ? 'An error occurred. Please try again.' : null
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setFormError('')
    try {
      await signIn('google', { callbackUrl })
    } catch {
      setFormError('Failed to sign in with Google')
      setIsGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError('')

    try {
      // Use NextAuth credentials provider
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error('Invalid email or password')
      }

      // Fetch user to check role for redirect
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        if (data.user?.role === 'ADMIN' || data.user?.role === 'DESIGNER') {
          router.push('/admin')
        } else {
          router.push(callbackUrl)
        }
      } else {
        router.push(callbackUrl)
      }
      router.refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const displayError = formError || getErrorMessage(error)

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
          <p className="text-text-light mb-8">
            {callbackUrl.includes('/checkout')
              ? 'Please sign in to complete your purchase'
              : 'Sign in to access your dashboard'}
          </p>

          {displayError && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
              {displayError}
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-lg bg-dark-surface hover:bg-dark-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <svg className="animate-spin h-5 w-5 text-text" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span className="text-text font-medium">
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-warm-white text-text-muted">or continue with email</span>
            </div>
          </div>

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
            {"Don't have an account? "}
            <Link
              href={callbackUrl !== '/dashboard' ? `/auth/register?redirect=${encodeURIComponent(callbackUrl)}` : '/auth/register'}
              className="text-walnut font-semibold hover:text-accent"
            >
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

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex bg-warm-white items-center justify-center">
      <div className="animate-pulse">
        <div className="w-10 h-10 bg-walnut/20 rounded-xl mx-auto mb-4"></div>
        <div className="h-4 w-32 bg-walnut/10 rounded mx-auto"></div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
