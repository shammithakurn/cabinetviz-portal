'use client'

import { useEffect, useState, useMemo } from 'react'

interface LanternsProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Lantern {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
  color: string
  swayAmount: number
  startOffset: number
}

const lanternColors = ['#FF0000', '#FF4500', '#FFD700', '#FF6347', '#DC143C']

export function Lanterns({ intensity = 'medium' }: LanternsProps) {
  const [isVisible, setIsVisible] = useState(true)

  const count = useMemo(() => {
    const counts = { low: 10, medium: 18, high: 28 }
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    return isMobile ? Math.floor(counts[intensity] * 0.5) : counts[intensity]
  }, [intensity])

  const lanterns = useMemo<Lantern[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3, // Faster initial appearance
      duration: 15 + Math.random() * 10,
      size: 40 + Math.random() * 30, // Bigger lanterns
      opacity: 0.9 + Math.random() * 0.1,
      color: lanternColors[Math.floor(Math.random() * lanternColors.length)],
      swayAmount: 15 + Math.random() * 25,
      startOffset: Math.random() * 60, // Some start mid-screen
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
      {lanterns.map((lantern) => (
        <div
          key={lantern.id}
          className="absolute animate-lantern-rise"
          style={{
            left: `${lantern.left}%`,
            bottom: '-80px',
            animationDelay: `${lantern.delay}s`,
            animationDuration: `${lantern.duration}s`,
            opacity: lantern.opacity,
            ['--sway-amount' as string]: `${lantern.swayAmount}px`,
          }}
        >
          <div
            className="animate-sway"
            style={{
              animationDuration: `${3 + Math.random() * 2}s`,
              fontSize: `${lantern.size}px`,
            }}
          >
            {/* Lantern SVG */}
            <svg
              width="1em"
              height="1.5em"
              viewBox="0 0 60 90"
              style={{
                filter: `drop-shadow(0 0 15px ${lantern.color})`,
              }}
            >
              {/* String */}
              <line x1="30" y1="0" x2="30" y2="15" stroke="#8B4513" strokeWidth="2" />
              {/* Top cap */}
              <rect x="20" y="15" width="20" height="5" fill="#8B4513" />
              {/* Lantern body */}
              <ellipse cx="30" cy="50" rx="25" ry="30" fill={lantern.color} opacity="0.9" />
              <ellipse cx="30" cy="50" rx="20" ry="25" fill={lantern.color} opacity="0.6" />
              {/* Inner glow */}
              <ellipse cx="30" cy="50" rx="15" ry="20" fill="#FFD700" opacity="0.5" />
              <ellipse cx="30" cy="50" rx="10" ry="15" fill="#FFFFFF" opacity="0.3" />
              {/* Bottom cap */}
              <rect x="20" y="78" width="20" height="5" fill="#8B4513" />
              {/* Tassel */}
              <line x1="30" y1="83" x2="30" y2="90" stroke="#FFD700" strokeWidth="3" />
            </svg>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes lantern-rise {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh);
            opacity: 0.3;
          }
        }
        @keyframes sway {
          0%, 100% {
            transform: translateX(0) rotate(-3deg);
          }
          50% {
            transform: translateX(var(--sway-amount, 15px)) rotate(3deg);
          }
        }
        .animate-lantern-rise {
          animation: lantern-rise ease-out infinite;
        }
        .animate-sway {
          animation: sway ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
