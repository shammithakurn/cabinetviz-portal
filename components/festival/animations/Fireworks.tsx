'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface FireworksProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface Firework {
  x: number
  y: number
  targetY: number
  vy: number
  exploded: boolean
  particles: Particle[]
  color: string
}

const colors = [
  '#FF0000', '#FFD700', '#00FF00', '#00BFFF', '#FF1493',
  '#FF4500', '#FFD700', '#7FFF00', '#DC143C', '#FF69B4',
]

export function Fireworks({ intensity = 'medium' }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fireworksRef = useRef<Firework[]>([])
  const animationRef = useRef<number>()
  const lastLaunchRef = useRef(0)
  const [isVisible, setIsVisible] = useState(true)

  const launchInterval = intensity === 'low' ? 2000 : intensity === 'medium' ? 1200 : 800
  const particleCount = intensity === 'low' ? 40 : intensity === 'medium' ? 60 : 80

  const createFirework = useCallback((canvas: HTMLCanvasElement): Firework => {
    const x = Math.random() * canvas.width
    const targetY = canvas.height * 0.2 + Math.random() * canvas.height * 0.3
    return {
      x,
      y: canvas.height,
      targetY,
      vy: -8 - Math.random() * 4,
      exploded: false,
      particles: [],
      color: colors[Math.floor(Math.random() * colors.length)],
    }
  }, [])

  const explode = useCallback((firework: Firework, count: number) => {
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count
      const speed = 2 + Math.random() * 4
      particles.push({
        x: firework.x,
        y: firework.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 60 + Math.random() * 40,
        color: firework.color,
        size: 2 + Math.random() * 2,
      })
    }
    firework.particles = particles
    firework.exploded = true
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas completely for transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const now = Date.now()

    // Launch new firework
    if (now - lastLaunchRef.current > launchInterval) {
      fireworksRef.current.push(createFirework(canvas))
      lastLaunchRef.current = now
    }

    // Update and draw fireworks
    fireworksRef.current = fireworksRef.current.filter((firework) => {
      if (!firework.exploded) {
        // Rising firework
        firework.y += firework.vy
        firework.vy += 0.05 // Gravity

        // Draw trail
        ctx.beginPath()
        ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = firework.color
        ctx.fill()

        // Check if should explode
        if (firework.y <= firework.targetY || firework.vy >= 0) {
          explode(firework, particleCount)
        }
        return true
      } else {
        // Update particles
        let hasLiveParticles = false
        firework.particles.forEach((particle) => {
          if (particle.life > 0) {
            particle.x += particle.vx
            particle.y += particle.vy
            particle.vy += 0.08 // Gravity
            particle.vx *= 0.98 // Drag
            particle.life -= 1 / particle.maxLife

            if (particle.life > 0) {
              hasLiveParticles = true

              // Draw particle with glow
              ctx.save()
              ctx.globalAlpha = particle.life
              ctx.beginPath()
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
              ctx.fillStyle = particle.color
              ctx.shadowBlur = 10
              ctx.shadowColor = particle.color
              ctx.fill()
              ctx.restore()
            }
          }
        })
        return hasLiveParticles
      }
    })

    animationRef.current = requestAnimationFrame(draw)
  }, [createFirework, explode, launchInterval, particleCount])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      draw()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw, isVisible])

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  if (!isVisible) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ background: 'transparent' }}
    />
  )
}
