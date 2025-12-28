// app/layout.tsx
// Root layout for the entire application

import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/providers/SessionProvider'

export const metadata: Metadata = {
  title: 'CabinetViz Portal',
  description: 'Customer portal for 3D cabinet visualization services',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'CabinetViz Portal',
    description: 'Professional 3D Cabinet Visualization Services',
    url: 'https://cabinetviz.com',
    siteName: 'CabinetViz',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CabinetViz - Professional 3D Cabinet Visualization',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CabinetViz Portal',
    description: 'Professional 3D Cabinet Visualization Services',
    images: ['/og-image.png'],
  },
  themeColor: '#C4A77D',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
