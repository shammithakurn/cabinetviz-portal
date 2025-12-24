'use client'

import { useEffect, useState, useMemo } from 'react'

interface HeartsProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Heart {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
  color: string
}

const heartColors = ['#FF1493', '#FF69B4', '#FFB6C1', '#DC143C', '#FF6B6B']

export function Hearts({ intensity = 'medium' }: HeartsProps) {
  const [isVisible, setIsVisible] = useState(true)

  const count = useMemo(() => {
    const counts = { low: 15, medium: 25, high: 40 }
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    return isMobile ? Math.floor(counts[intensity] * 0.5) : counts[intensity]
  }, [intensity])

  const hearts = useMemo<Heart[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 12 + Math.random() * 16,
      opacity: 0.5 + Math.random() * 0.5,
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
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
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-float-up"
          style={{
            left: `${heart.left}%`,
            bottom: '-50px',
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`,
            opacity: heart.opacity,
            color: heart.color,
          }}
        >
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ filter: `drop-shadow(0 0 4px ${heart.color})` }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-50vh) scale(1.1) rotate(15deg);
          }
          100% {
            transform: translateY(-100vh) scale(0.8) rotate(-15deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
