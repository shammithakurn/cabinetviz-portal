'use client'

import { useEffect, useRef, useCallback } from 'react'

interface HoliProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  type: 'powder' | 'splash' | 'emoji'
  emoji?: string
  rotation: number
  rotationSpeed: number
  spread: number
}

// Vibrant Holi colors
const holiColors = [
  '#FF1493', // Deep Pink
  '#FF6B35', // Orange
  '#FFD700', // Gold
  '#00FF7F', // Spring Green
  '#00BFFF', // Deep Sky Blue
  '#9400D3', // Dark Violet
  '#FF4500', // Orange Red
  '#7CFC00', // Lawn Green
  '#FF69B4', // Hot Pink
  '#40E0D0', // Turquoise
]

const holiEmojis = ['🎨', '💜', '💛', '💚', '💙', '🧡', '💗', '🌈', '✨', '🎉', '💐', '🌸']

export function Holi({ intensity = 'medium' }: HoliProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const lastSpawnRef = useRef(0)
  const lastBurstRef = useRef(0)

  const getIntensityMultiplier = useCallback(() => {
    const multipliers = { low: 0.5, medium: 1, high: 1.5 }
    return multipliers[intensity]
  }, [intensity])

  const createPowder = useCallback((canvas: HTMLCanvasElement, burstX?: number, burstY?: number): Particle[] => {
    const particles: Particle[] = []
    const isBurst = burstX !== undefined && burstY !== undefined
    const count = isBurst ? 30 : 1

    for (let i = 0; i < count; i++) {
      const color = holiColors[Math.floor(Math.random() * holiColors.length)]
      const x = isBurst ? burstX : Math.random() * canvas.width
      const y = isBurst ? burstY : -20

      particles.push({
        x,
        y,
        vx: isBurst ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 2,
        vy: isBurst ? (Math.random() - 0.5) * 8 : 1 + Math.random() * 2,
        size: isBurst ? 3 + Math.random() * 5 : 8 + Math.random() * 12,
        color,
        life: 1,
        type: 'powder',
        rotation: 0,
        rotationSpeed: 0,
        spread: isBurst ? 0.98 : 1,
      })
    }

    // Add emoji particles occasionally
    if (!isBurst && Math.random() > 0.7) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -30,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 1 + Math.random() * 1.5,
        size: 25 + Math.random() * 20,
        color: '#FFFFFF',
        life: 1,
        type: 'emoji',
        emoji: holiEmojis[Math.floor(Math.random() * holiEmojis.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3,
        spread: 1,
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
    const spawnInterval = Math.max(30, 80 - 30 * intensityMultiplier)
    const burstInterval = Math.max(800, 2000 - 600 * intensityMultiplier)
    const maxParticles = Math.floor(200 * intensityMultiplier)

    const animate = () => {
      const now = Date.now()

      // Clear canvas fully - no trail effect to preserve website background
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn continuous powder rain
      if (now - lastSpawnRef.current > spawnInterval && particlesRef.current.length < maxParticles) {
        particlesRef.current.push(...createPowder(canvas))
        lastSpawnRef.current = now
      }

      // Create color bursts
      if (now - lastBurstRef.current > burstInterval) {
        const burstX = Math.random() * canvas.width
        const burstY = canvas.height * 0.3 + Math.random() * canvas.height * 0.4
        particlesRef.current.push(...createPowder(canvas, burstX, burstY))
        lastBurstRef.current = now
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.type === 'powder') {
          // Apply gravity and air resistance
          particle.vy += 0.03
          particle.vx *= particle.spread
          particle.vy *= particle.spread

          // Slight wind
          particle.vx += (Math.random() - 0.5) * 0.1

          // Fade
          if (particle.y > canvas.height * 0.6) {
            particle.life -= 0.015
          }

          // Draw powder with glow
          if (particle.life > 0) {
            ctx.save()
            ctx.globalAlpha = particle.life * 0.8
            ctx.fillStyle = particle.color
            ctx.shadowColor = particle.color
            ctx.shadowBlur = particle.size

            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }
        } else if (particle.type === 'emoji' && particle.emoji) {
          particle.rotation += particle.rotationSpeed
          particle.vy += 0.02

          // Swing motion
          particle.x += Math.sin(now * 0.002 + particle.rotation) * 0.5

          if (particle.y > canvas.height * 0.7) {
            particle.life -= 0.01
          }

          if (particle.life > 0) {
            ctx.save()
            ctx.translate(particle.x, particle.y)
            ctx.rotate((particle.rotation * Math.PI) / 180)
            ctx.globalAlpha = particle.life
            ctx.font = `${particle.size}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(particle.emoji, 0, 0)
            ctx.restore()
          }
        }

        return particle.life > 0 && particle.y < canvas.height + 50 &&
               particle.x > -50 && particle.x < canvas.width + 50
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [createPowder, getIntensityMultiplier])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45]"
      style={{ background: 'transparent' }}
    />
  )
}
