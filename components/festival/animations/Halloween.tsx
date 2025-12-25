'use client'

import { useEffect, useRef, useCallback } from 'react'

interface HalloweenProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  emoji: string
  size: number
  rotation: number
  rotationSpeed: number
  life: number
  swingOffset: number
  swingSpeed: number
}

// Spooky Halloween emojis
const halloweenEmojis = ['🎃', '👻', '🦇', '🕷️', '💀', '🕸️', '🧙', '🌙', '⭐', '🍬', '🍭']

export function Halloween({ intensity = 'medium' }: HalloweenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const lastSpawnRef = useRef(0)

  const getIntensityMultiplier = useCallback(() => {
    const multipliers = { low: 0.5, medium: 1, high: 1.5 }
    return multipliers[intensity]
  }, [intensity])

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const emoji = halloweenEmojis[Math.floor(Math.random() * halloweenEmojis.length)]
    const size = 25 + Math.random() * 25
    const speed = 1 + Math.random() * 2

    // Some particles come from top, some float up from bottom
    const fromTop = Math.random() > 0.3
    const startY = fromTop ? -size : canvas.height + size
    const velocityY = fromTop ? speed : -speed * 0.7

    return {
      x: Math.random() * canvas.width,
      y: startY,
      vx: (Math.random() - 0.5) * 2,
      vy: velocityY,
      emoji,
      size,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 3,
      life: 1,
      swingOffset: Math.random() * Math.PI * 2,
      swingSpeed: 0.02 + Math.random() * 0.02,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const intensityMultiplier = getIntensityMultiplier()
    const spawnInterval = Math.max(50, 150 - 50 * intensityMultiplier)
    const maxParticles = Math.floor(40 * intensityMultiplier)

    const draw = () => {
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

        // Apply swing effect
        particle.swingOffset += particle.swingSpeed
        particle.x += Math.sin(particle.swingOffset) * 1.5

        // Update rotation
        particle.rotation += particle.rotationSpeed

        // Apply slight gravity for falling, buoyancy for rising
        if (particle.vy > 0) {
          particle.vy += 0.01 // gravity
        } else {
          particle.vy -= 0.005 // slight upward acceleration
        }

        // Add wind drift
        particle.vx += (Math.random() - 0.5) * 0.1

        // Fade based on position
        if (particle.vy > 0 && particle.y > canvas.height * 0.7) {
          particle.life -= 0.015
        } else if (particle.vy < 0 && particle.y < canvas.height * 0.3) {
          particle.life -= 0.015
        }

        // Check if particle is still visible
        const isVisible =
          particle.life > 0 &&
          particle.y > -100 &&
          particle.y < canvas.height + 100

        // Draw particle
        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life
          ctx.font = `${particle.size}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(particle.emoji, 0, 0)
          ctx.restore()
          return true
        }
        return false
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    animationRef.current = requestAnimationFrame(draw)

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
      className="fixed inset-0 pointer-events-none z-40"
      style={{ background: 'transparent' }}
    />
  )
}
