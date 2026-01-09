// app/auth/logout/page.tsx
// Logout page that clears all authentication sessions

'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'

export default function LogoutPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function performLogout() {
      try {
        // Sign out from NextAuth (clears session cookies)
        await signOut({
          callbackUrl: '/auth/login',
          redirect: true
        })
      } catch (error) {
        console.error('Logout error:', error)
        // Fallback: redirect to login anyway
        window.location.href = '/auth/login'
      }
    }

    performLogout()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-walnut mx-auto mb-4"></div>
        <p className="text-text-light">Signing out...</p>
      </div>
    </div>
  )
}
