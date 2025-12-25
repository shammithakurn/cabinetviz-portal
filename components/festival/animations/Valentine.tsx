'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ValentineProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  swingOffset: number
  swingSpeed: number
  life: number
  type: 'heart' | 'rose' | 'sparkle'
  emoji?: string
  pulsePhase: number
}

const valentineEmojis = ['❤️', '💕', '💖', '💗', '💘', '💝', '💓', '💞', '🌹', '🥀', '💐', '💑', '💏', '🦋', '✨']
const heartColors = ['#FF1744', '#FF4081', '#F50057', '#E91E63', '#C51162', '#FF80AB', '#FF5252', '#D50000']

export function Valentine({ intensity = 'medium' }: ValentineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const lastSpawnRef = useRef(0)

  const getIntensityMultiplier = useCallback(() => {
    const multipliers = { low: 0.5, medium: 1, high: 1.5 }
    return multipliers[intensity]
  }, [intensity])

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const type = Math.random() > 0.3 ? 'heart' : Math.random() > 0.5 ? 'rose' : 'sparkle'
    const fromSide = Math.random() > 0.7

    let emoji: string
    if (type === 'heart') {
      emoji = valentineEmojis[Math.floor(Math.random() * 9)] // Hearts only
    } else if (type === 'rose') {
      emoji = valentineEmojis[9 + Math.floor(Math.random() * 3)] // Roses and flowers
    } else {
      emoji = valentineEmojis[12 + Math.floor(Math.random() * 3)] // Sparkles and couples
    }

    return {
      x: fromSide ? (Math.random() > 0.5 ? -30 : canvas.width + 30) : Math.random() * canvas.width,
      y: fromSide ? Math.random() * canvas.height * 0.7 : -30,
      vx: fromSide ? (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random()) : (Math.random() - 0.5) * 0.5,
      vy: 0.5 + Math.random() * 1.5,
      size: 20 + Math.random() * 25,
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      rotation: Math.random() * 30 - 15,
      rotationSpeed: (Math.random() - 0.5) * 2,
      swingOffset: Math.random() * Math.PI * 2,
      swingSpeed: 0.02 + Math.random() * 0.02,
      life: 1,
      type,
      emoji,
      pulsePhase: Math.random() * Math.PI * 2,
    }
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
    const spawnInterval = Math.max(50, 150 - 50 * intensityMultiplier)
    const maxParticles = Math.floor(60 * intensityMultiplier)

    const drawHeart = (x: number, y: number, size: number, color: string, alpha: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = alpha
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 15

      ctx.beginPath()
      const scale = size / 30
      ctx.moveTo(0, -8 * scale)
      ctx.bezierCurveTo(-15 * scale, -25 * scale, -30 * scale, -5 * scale, 0, 20 * scale)
      ctx.bezierCurveTo(30 * scale, -5 * scale, 15 * scale, -25 * scale, 0, -8 * scale)
      ctx.fill()
      ctx.restore()
    }

    const animate = () => {
      const now = Date.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn new particles
      if (now - lastSpawnRef.current > spawnInterval && particlesRef.current.length < maxParticles) {
        particlesRef.current.push(createParticle(canvas))
        lastSpawnRef.current = now
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed
        particle.pulsePhase += 0.1

        // Swing motion
        particle.swingOffset += particle.swingSpeed
        particle.x += Math.sin(particle.swingOffset) * 1.5

        // Fade when near bottom
        if (particle.y > canvas.height * 0.7) {
          particle.life -= 0.015
        }

        // Check visibility
        const isVisible = particle.life > 0 && particle.y < canvas.height + 50 &&
                         particle.x > -50 && particle.x < canvas.width + 50

        if (isVisible) {
          const pulseScale = 1 + Math.sin(particle.pulsePhase) * 0.1

          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          if (particle.emoji) {
            ctx.font = `${particle.size * pulseScale}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(particle.emoji, 0, 0)
          }

          // Add sparkle effect for hearts
          if (particle.type === 'heart' && Math.random() > 0.95) {
            ctx.font = '12px Arial'
            ctx.fillText('✨', Math.random() * 20 - 10, Math.random() * 20 - 10)
          }

          ctx.restore()
          return true
        }
        return false
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
  }, [createParticle, getIntensityMultiplier])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45]"
      style={{ background: 'transparent' }}
    />
  )
}
