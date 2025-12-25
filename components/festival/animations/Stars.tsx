'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface StarsProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Star {
  x: number
  y: number
  size: number
  baseOpacity: number
  twinkleSpeed: number
  twinklePhase: number
  color: string
}

interface Moon {
  x: number
  y: number
  glowPhase: number
}

const starColors = ['#FFD700', '#FFFFFF', '#87CEEB', '#F0E68C', '#FFFACD']

export function Stars({ intensity = 'medium' }: StarsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const moonsRef = useRef<Moon[]>([])
  const animationRef = useRef<number>()
  const [isVisible, setIsVisible] = useState(true)

  const getCount = useCallback(() => {
    const counts = { low: 30, medium: 50, high: 70 }
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    return isMobile ? Math.floor(counts[intensity] * 0.5) : counts[intensity]
  }, [intensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const count = getCount()

      // Initialize stars
      starsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.85,
        size: 14 + Math.random() * 22,
        baseOpacity: 0.7 + Math.random() * 0.3,
        twinkleSpeed: 0.02 + Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      }))

      // Initialize moons
      moonsRef.current = [1, 2, 3].map((i) => ({
        x: (0.2 + i * 0.25) * canvas.width,
        y: (0.1 + i * 0.08) * canvas.height,
        glowPhase: i * 0.5,
      }))
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const drawStar = (x: number, y: number, size: number, color: string, opacity: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = size / 2

      // Draw 5-pointed star
      ctx.beginPath()
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
        const outerRadius = size / 2
        const innerRadius = size / 4

        if (i === 0) {
          ctx.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
        } else {
          ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
        }

        const innerAngle = angle + (2 * Math.PI) / 10
        ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius)
      }
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }

    const drawMoon = (x: number, y: number, glowIntensity: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = 0.6 + glowIntensity * 0.4
      ctx.fillStyle = '#FFD700'
      ctx.shadowColor = '#FFD700'
      ctx.shadowBlur = 20 + glowIntensity * 20

      // Draw crescent moon using arc
      ctx.beginPath()
      ctx.arc(0, 0, 20, 0, Math.PI * 2)
      ctx.fill()

      // Create crescent effect by drawing a dark circle
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(8, -5, 18, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      if (!isVisible) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update stars
      starsRef.current.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed
        const twinkle = (Math.sin(star.twinklePhase) + 1) / 2 // 0 to 1
        const scale = 0.8 + twinkle * 0.4
        const opacity = 0.3 + twinkle * 0.7

        drawStar(star.x, star.y, star.size * scale, star.color, opacity * star.baseOpacity)
      })

      // Draw and update moons
      moonsRef.current.forEach((moon) => {
        moon.glowPhase += 0.005
        const glowIntensity = (Math.sin(moon.glowPhase) + 1) / 2
        drawMoon(moon.x, moon.y, glowIntensity)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    const handleVisibility = () => {
      setIsVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', handleVisibility)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [getCount, isVisible])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ background: 'transparent' }}
    />
  )
}
