'use client'

import { useEffect, useRef, useCallback } from 'react'

interface NewYearProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  type: 'firework' | 'spark' | 'confetti' | 'champagne'
  color: string
  size: number
  life: number
  maxLife: number
  rotation: number
  rotationSpeed: number
  emoji?: string
  trail?: { x: number; y: number }[]
}

const celebrationEmojis = ['🎆', '🎇', '🎊', '🎉', '🥂', '🍾', '✨', '🌟', '💫', '🎈']
const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

export function NewYear({ intensity = 'medium' }: NewYearProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const lastFireworkRef = useRef(0)

  const getIntensityMultiplier = useCallback(() => {
    const multipliers = { low: 0.5, medium: 1, high: 1.5 }
    return multipliers[intensity]
  }, [intensity])

  const createFirework = useCallback((canvas: HTMLCanvasElement): Particle => {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 2,
      vy: -(8 + Math.random() * 4),
      type: 'firework',
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      size: 4,
      life: 1,
      maxLife: 1,
      rotation: 0,
      rotationSpeed: 0,
      trail: [],
    }
  }, [])

  const createExplosion = useCallback((x: number, y: number, color: string): Particle[] => {
    const particles: Particle[] = []
    const sparkCount = 30 + Math.floor(Math.random() * 20)

    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5
      const speed = 2 + Math.random() * 4
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: 'spark',
        color,
        size: 2 + Math.random() * 2,
        life: 1,
        maxLife: 1,
        rotation: 0,
        rotationSpeed: 0,
      })
    }

    // Add some celebration emojis
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 2
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        type: 'confetti',
        color: '#FFFFFF',
        size: 20 + Math.random() * 15,
        life: 1,
        maxLife: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        emoji: celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)],
      })
    }

    return particles
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const intensityMultiplier = getIntensityMultiplier()
    const fireworkInterval = Math.max(500, 1500 - 500 * intensityMultiplier)

    const animate = () => {
      const now = Date.now()
      // Clear canvas fully to preserve website background
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Launch new fireworks
      if (now - lastFireworkRef.current > fireworkInterval) {
        particlesRef.current.push(createFirework(canvas))
        lastFireworkRef.current = now
      }

      // Update and draw particles
      const newParticles: Particle[] = []

      particlesRef.current = particlesRef.current.filter((particle) => {
        if (particle.type === 'firework') {
          // Update trail
          if (particle.trail) {
            particle.trail.push({ x: particle.x, y: particle.y })
            if (particle.trail.length > 10) particle.trail.shift()
          }

          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.1 // gravity

          // Draw trail
          if (particle.trail && particle.trail.length > 1) {
            ctx.beginPath()
            ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
            for (let i = 1; i < particle.trail.length; i++) {
              ctx.lineTo(particle.trail[i].x, particle.trail[i].y)
            }
            ctx.strokeStyle = particle.color
            ctx.lineWidth = 2
            ctx.stroke()
          }

          // Draw firework head
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.fill()

          // Explode when velocity is near zero
          if (particle.vy > -1) {
            newParticles.push(...createExplosion(particle.x, particle.y, particle.color))
            return false
          }

          return particle.y > 0
        } else if (particle.type === 'spark') {
          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.05
          particle.vx *= 0.98
          particle.life -= 0.02

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
          ctx.globalAlpha = particle.life
          ctx.fill()
          ctx.globalAlpha = 1

          return particle.life > 0
        } else if (particle.type === 'confetti' && particle.emoji) {
          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.03
          particle.rotation += particle.rotationSpeed
          particle.life -= 0.008

          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life
          ctx.font = `${particle.size}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(particle.emoji, 0, 0)
          ctx.restore()

          return particle.life > 0 && particle.y < canvas.height + 50
        }

        return false
      })

      particlesRef.current.push(...newParticles)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [createFirework, createExplosion, getIntensityMultiplier])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45]"
      style={{ background: 'transparent' }}
    />
  )
}
