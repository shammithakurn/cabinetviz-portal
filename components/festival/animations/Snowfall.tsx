'use client'

import { useEffect, useState, useMemo } from 'react'

interface SnowfallProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Snowflake {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
}

export function Snowfall({ intensity = 'medium' }: SnowfallProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Determine snowflake count based on intensity
  const count = useMemo(() => {
    const counts = { low: 20, medium: 35, high: 50 }
    // Reduce on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    return isMobile ? Math.floor(counts[intensity] * 0.5) : counts[intensity]
  }, [intensity])

  // Generate snowflakes with random properties
  const snowflakes = useMemo<Snowflake[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 7,
      size: 4 + Math.random() * 8,
      opacity: 0.4 + Math.random() * 0.6,
    }))
  }, [count])

  // Pause animation when tab is not visible
  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-[45]"
      style={{ visibility: isVisible ? 'visible' : 'hidden' }}
    >
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute animate-snowfall"
          style={{
            left: `${flake.left}%`,
            top: '-20px',
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
          }}
        >
          <div
            className="w-full h-full bg-white rounded-full shadow-lg"
            style={{
              boxShadow: '0 0 10px rgba(255,255,255,0.8)',
            }}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.3;
          }
        }
        .animate-snowfall {
          animation: snowfall linear infinite;
        }
      `}</style>
    </div>
  )
}
