'use client'

import { useEffect, useState, useMemo } from 'react'

interface LeavesProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Leaf {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  opacity: number
  color: string
  rotation: number
}

const leafColors = ['#D2691E', '#8B4513', '#CD853F', '#DEB887', '#F4A460', '#228B22', '#6B8E23']

export function Leaves({ intensity = 'medium' }: LeavesProps) {
  const [isVisible, setIsVisible] = useState(true)

  const count = useMemo(() => {
    const counts = { low: 15, medium: 25, high: 40 }
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    return isMobile ? Math.floor(counts[intensity] * 0.5) : counts[intensity]
  }, [intensity])

  const leaves = useMemo<Leaf[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      size: 16 + Math.random() * 16,
      opacity: 0.6 + Math.random() * 0.4,
      color: leafColors[Math.floor(Math.random() * leafColors.length)],
      rotation: Math.random() * 360,
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
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="absolute animate-leaf-fall"
          style={{
            left: `${leaf.left}%`,
            top: '-50px',
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
            fontSize: `${leaf.size}px`,
            opacity: leaf.opacity,
            color: leaf.color,
            transform: `rotate(${leaf.rotation}deg)`,
          }}
        >
          <svg
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ filter: `drop-shadow(0 2px 3px rgba(0,0,0,0.2))` }}
          >
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
          </svg>
        </div>
      ))}
      <style jsx>{`
        @keyframes leaf-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(30px) rotate(90deg);
          }
          50% {
            transform: translateY(50vh) translateX(-20px) rotate(180deg);
          }
          75% {
            transform: translateY(75vh) translateX(25px) rotate(270deg);
          }
          100% {
            transform: translateY(100vh) translateX(0) rotate(360deg);
            opacity: 0.3;
          }
        }
        .animate-leaf-fall {
          animation: leaf-fall ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
