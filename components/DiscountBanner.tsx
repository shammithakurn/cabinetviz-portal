// components/DiscountBanner.tsx
// Floating corner ribbon for site-wide discounts

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type SiteDiscount = {
  id: string
  name: string
  type: string
  value: number
  bannerText: string | null
  bannerColor: string | null
  appliesTo: string
  startDate: string
  endDate: string
}

export default function DiscountBanner({ discount }: { discount: SiteDiscount | null }) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!discount) return

    const calculateTimeLeft = () => {
      const endDate = new Date(discount.endDate)
      const now = new Date()
      const difference = endDate.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft('Ending soon!')
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000)

    return () => clearInterval(timer)
  }, [discount])

  if (!discount || !isVisible) return null

  const bannerColor = discount.bannerColor || '#B87333'
  const discountText = discount.type === 'PERCENTAGE'
    ? `${discount.value}%`
    : `$${discount.value}`

  return (
    <>
      {/* Floating Corner Ribbon */}
      <div
        className={`fixed bottom-6 left-6 z-[60] transition-all duration-300 ${
          isExpanded ? 'scale-100' : 'scale-100'
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Expanded Card */}
        <div
          className={`absolute bottom-0 left-0 transition-all duration-300 origin-bottom-left ${
            isExpanded
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div
            className="rounded-2xl shadow-2xl overflow-hidden min-w-[280px]"
            style={{ backgroundColor: bannerColor }}
          >
            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsVisible(false)
              }}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 transition-colors text-white/80 hover:text-white z-10"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-5 text-white">
              {/* Sale badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl animate-bounce">🎉</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-full">
                  Limited Time
                </span>
              </div>

              {/* Discount amount */}
              <div className="text-4xl font-bold mb-1">
                {discountText} OFF
              </div>

              {/* Sale name */}
              <p className="text-white/90 font-medium mb-3">
                {discount.bannerText || discount.name}
              </p>

              {/* Timer */}
              <div className="flex items-center gap-2 text-sm bg-black/20 rounded-lg px-3 py-2 mb-4">
                <span>⏰</span>
                <span>Ends in {timeLeft}</span>
              </div>

              {/* CTA */}
              <Link
                href="/auth/register"
                className="block w-full text-center bg-white text-gray-900 px-4 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-[1.02] shadow-lg"
              >
                Claim This Offer →
              </Link>
            </div>
          </div>
        </div>

        {/* Collapsed Badge - Always visible */}
        <div
          className={`relative cursor-pointer transition-all duration-300 ${
            isExpanded ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
          }`}
        >
          <div
            className="relative rounded-full shadow-2xl overflow-hidden animate-pulse-slow"
            style={{ backgroundColor: bannerColor }}
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 animate-ping opacity-30 rounded-full"
              style={{ backgroundColor: bannerColor }}
            />

            <div className="relative px-5 py-4 text-white flex items-center gap-3">
              <span className="text-2xl">🏷️</span>
              <div className="flex flex-col">
                <span className="text-xl font-bold leading-tight">{discountText} OFF</span>
                <span className="text-xs text-white/80">{timeLeft} left</span>
              </div>
            </div>
          </div>

          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        </div>
      </div>

      <style jsx>{`
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
          }
        }
      `}</style>
    </>
  )
}
