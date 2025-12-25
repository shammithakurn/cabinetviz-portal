'use client'

import { useEffect, useState, useMemo } from 'react'

interface DiyasProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Diya {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
  flickerSpeed: number
}

export function Diyas({ intensity = 'medium' }: DiyasProps) {
  const [isVisible, setIsVisible] = useState(true)

  const count = useMemo(() => {
    const counts = { low: 12, medium: 20, high: 30 }
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    return isMobile ? Math.floor(counts[intensity] * 0.5) : counts[intensity]
  }, [intensity])

  const diyas = useMemo<Diya[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 10 + Math.random() * 8,
      size: 24 + Math.random() * 16,
      opacity: 0.7 + Math.random() * 0.3,
      flickerSpeed: 0.5 + Math.random() * 0.5,
    }))
  }, [count])

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
      {diyas.map((diya) => (
        <div
          key={diya.id}
          className="absolute animate-diya-float"
          style={{
            left: `${diya.left}%`,
            bottom: '-60px',
            animationDelay: `${diya.delay}s`,
            animationDuration: `${diya.duration}s`,
            fontSize: `${diya.size}px`,
            opacity: diya.opacity,
          }}
        >
          <div className="relative">
            {/* Diya lamp */}
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 100 100"
              className="text-amber-700"
              fill="currentColor"
            >
              {/* Bowl */}
              <ellipse cx="50" cy="75" rx="35" ry="15" fill="#CD853F" />
              <ellipse cx="50" cy="70" rx="30" ry="12" fill="#DEB887" />
              <ellipse cx="50" cy="68" rx="25" ry="8" fill="#8B4513" />
            </svg>
            {/* Flame */}
            <div
              className="absolute left-1/2 -translate-x-1/2 animate-flicker"
              style={{
                top: '15%',
                animationDuration: `${diya.flickerSpeed}s`,
              }}
            >
              <div
                className="w-3 h-5 rounded-full"
                style={{
                  background: 'linear-gradient(to top, #FF6600, #FFD700, #FFFF00)',
                  boxShadow: '0 0 20px #FF6600, 0 0 40px #FFD700, 0 0 60px #FF8C00',
                  filter: 'blur(1px)',
                }}
              />
            </div>
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes diya-float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-50vh) translateX(20px);
          }
          100% {
            transform: translateY(-100vh) translateX(-10px);
            opacity: 0.5;
          }
        }
        @keyframes flicker {
          0%, 100% {
            transform: translateX(-50%) scale(1);
            opacity: 1;
          }
          25% {
            transform: translateX(-50%) scale(1.05) rotate(2deg);
            opacity: 0.9;
          }
          50% {
            transform: translateX(-50%) scale(0.95);
            opacity: 1;
          }
          75% {
            transform: translateX(-50%) scale(1.02) rotate(-2deg);
            opacity: 0.95;
          }
        }
        .animate-diya-float {
          animation: diya-float ease-in-out infinite;
        }
        .animate-flicker {
          animation: flicker ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
