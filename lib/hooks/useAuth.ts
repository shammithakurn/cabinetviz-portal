// lib/hooks/useAuth.ts
// Custom hook for authentication state and actions

'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export interface UseAuthReturn {
  user: {
    id: string
    name: string | null | undefined
    email: string | null | undefined
    image: string | null | undefined
    role: string
  } | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isDesigner: boolean
  isCustomer: boolean
  signInWithGoogle: () => Promise<void>
  signInWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user

  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role || 'CUSTOMER',
      }
    : null

  const isAdmin = user?.role === 'ADMIN'
  const isDesigner = user?.role === 'DESIGNER'
  const isCustomer = user?.role === 'CUSTOMER'

  const signInWithGoogle = useCallback(async () => {
    await signIn('google', { callbackUrl: '/dashboard' })
  }, [])

  const signInWithCredentials = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { success: false, error: 'Invalid email or password' }
      }

      router.refresh()
      return { success: true }
    } catch {
      return { success: false, error: 'An error occurred' }
    }
  }, [router])

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isDesigner,
    isCustomer,
    signInWithGoogle,
    signInWithCredentials,
    logout,
  }
}
