'use client'

import { useEffect, useState, useMemo } from 'react'

interface StarsProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Star {
  id: number
  left: number
  top: number
  delay: number
  duration: number
  size: number
  opacity: number
  color: string
}

const starColors = ['#FFD700', '#FFFFFF', '#87CEEB', '#F0E68C', '#FFFACD']

export function Stars({ intensity = 'medium' }: StarsProps) {
  const [isVisible, setIsVisible] = useState(true)

  const count = useMemo(() => {
    const counts = { low: 30, medium: 50, high: 70 }
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    return isMobile ? Math.floor(counts[intensity] * 0.5) : counts[intensity]
  }, [intensity])

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 85, // Cover most of the screen (85%)
      delay: Math.random() * 2, // Faster initial appearance
      duration: 1.5 + Math.random() * 2,
      size: 14 + Math.random() * 22, // Bigger stars
      opacity: 0.7 + Math.random() * 0.3,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }))
  }, [count])

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            fontSize: `${star.size}px`,
            color: star.color,
          }}
        >
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              filter: `drop-shadow(0 0 ${star.size / 2}px ${star.color})`,
            }}
          >
            <path d="M12 2L14.4 8.2L21 9.2L16.5 13.5L17.7 20L12 17L6.3 20L7.5 13.5L3 9.2L9.6 8.2L12 2Z" />
          </svg>
        </div>
      ))}
      {/* Add some crescent moons for Islamic festivals */}
      {[1, 2, 3].map((i) => (
        <div
          key={`moon-${i}`}
          className="absolute animate-moon-glow"
          style={{
            left: `${20 + i * 25}%`,
            top: `${10 + i * 8}%`,
            animationDelay: `${i * 0.5}s`,
            fontSize: '40px',
            color: '#FFD700',
          }}
        >
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{
              filter: 'drop-shadow(0 0 20px #FFD700)',
            }}
          >
            <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
          </svg>
        </div>
      ))}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        @keyframes moon-glow {
          0%, 100% {
            opacity: 0.6;
            filter: drop-shadow(0 0 20px #FFD700);
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 40px #FFD700);
          }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
        .animate-moon-glow {
          animation: moon-glow ease-in-out 4s infinite;
        }
      `}</style>
    </div>
  )
}
