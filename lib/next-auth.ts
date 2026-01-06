// lib/next-auth.ts
// NextAuth.js v5 main configuration with Prisma adapter

import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { authConfig } from './auth.config'

// Custom adapter to handle the 'name' field requirement
const customAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: { email: string; emailVerified: Date | null; name?: string | null; image?: string | null }) => {
    // Ensure name is set (use email prefix if not provided)
    const name = data.name || data.email.split('@')[0]

    const user = await prisma.user.create({
      data: {
        email: data.email,
        emailVerified: data.emailVerified,
        name: name,
        image: data.image,
        role: 'CUSTOMER', // Default role for new OAuth users
      },
    })
    return user
  },
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: customAdapter,
  ...authConfig,
  providers: [
    ...authConfig.providers,
    // Credentials provider - only in server-side config (not edge-compatible)
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image || user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // For OAuth providers, check if user exists with this email
      if (account?.provider !== 'credentials') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true },
        })

        if (existingUser) {
          // Check if this OAuth account is already linked
          const existingAccount = existingUser.accounts.find(
            (acc) =>
              acc.provider === account?.provider &&
              acc.providerAccountId === account?.providerAccountId
          )

          if (!existingAccount) {
            // Link the OAuth account to existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account!.type,
                provider: account!.provider,
                providerAccountId: account!.providerAccountId,
                access_token: account!.access_token,
                refresh_token: account!.refresh_token,
                expires_at: account!.expires_at,
                token_type: account!.token_type,
                scope: account!.scope,
                id_token: account!.id_token,
              },
            })
          }

          // Update user image from OAuth if not set
          if (!existingUser.image && profile?.picture) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { image: profile.picture as string },
            })
          }

          // Return user info with existing role
          user.id = existingUser.id
          user.role = existingUser.role
        } else {
          // New user - set name from Google profile
          if (profile?.name) {
            user.name = profile.name as string
          }
        }
      }

      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role || 'CUSTOMER'
      }

      // For OAuth, fetch the role from database
      if (account && account.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token.name = session.name
        token.role = session.role
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
