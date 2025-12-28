// app/not-found.tsx
// 404 Not Found page

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-walnut/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-text mb-2">Page not found</h1>
        <p className="text-text-light mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-walnut text-white font-semibold rounded-lg hover:bg-walnut-dark transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border border-border text-text font-semibold rounded-lg hover:bg-dark-elevated transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
