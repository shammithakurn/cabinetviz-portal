// app/auth/error/page.tsx
// Authentication error page

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'There is a problem with the server configuration. Please contact support.',
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to sign in.',
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          message: 'The verification link may have expired or already been used.',
        }
      case 'OAuthSignin':
        return {
          title: 'OAuth Sign In Error',
          message: 'There was a problem starting the sign in process. Please try again.',
        }
      case 'OAuthCallback':
        return {
          title: 'OAuth Callback Error',
          message: 'There was a problem completing the sign in process. Please try again.',
        }
      case 'OAuthCreateAccount':
        return {
          title: 'Account Creation Error',
          message: 'Could not create an account with this OAuth provider.',
        }
      case 'EmailCreateAccount':
        return {
          title: 'Account Creation Error',
          message: 'Could not create an account with this email.',
        }
      case 'Callback':
        return {
          title: 'Callback Error',
          message: 'There was an error during the authentication callback.',
        }
      case 'OAuthAccountNotLinked':
        return {
          title: 'Account Already Exists',
          message: 'An account with this email already exists. Please sign in with your password first, then link your Google account from your profile settings.',
        }
      case 'EmailSignin':
        return {
          title: 'Email Sign In Error',
          message: 'Could not send the sign in email. Please try again.',
        }
      case 'CredentialsSignin':
        return {
          title: 'Sign In Failed',
          message: 'The email or password you entered is incorrect.',
        }
      case 'SessionRequired':
        return {
          title: 'Sign In Required',
          message: 'Please sign in to access this page.',
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An unexpected error occurred during authentication. Please try again.',
        }
    }
  }

  const { title, message } = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white p-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 bg-walnut rounded-xl flex items-center justify-center text-warm-white text-xl">
            ⬡
          </div>
          <span className="text-xl font-bold text-text">CabinetViz</span>
        </Link>

        {/* Error Card */}
        <div className="bg-dark-surface border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-text mb-2">{title}</h1>
          <p className="text-text-light mb-8">{message}</p>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="btn btn-primary w-full py-3"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="btn btn-secondary w-full py-3"
            >
              Go to Home
            </Link>
          </div>

          {error && (
            <p className="mt-6 text-xs text-text-muted">
              Error code: {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ErrorSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white p-8">
      <div className="animate-pulse">
        <div className="w-10 h-10 bg-walnut/20 rounded-xl mx-auto mb-4"></div>
        <div className="h-4 w-32 bg-walnut/10 rounded mx-auto"></div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<ErrorSkeleton />}>
      <AuthErrorContent />
    </Suspense>
  )
}
