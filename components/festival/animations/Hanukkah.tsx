'use client'

import { useEffect, useRef, useCallback } from 'react'

interface HanukkahProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  type: 'menorah' | 'dreidel' | 'star' | 'candle' | 'gelt'
  emoji?: string
  rotation: number
  rotationSpeed: number
  glowPhase: number
  spinSpeed: number
}

const hanukkahEmojis = {
  menorahs: ['🕎'],
  dreidels: ['🪆'],
  stars: ['✡️', '⭐', '🌟', '✨', '💫'],
  candles: ['🕯️'],
  gelt: ['🪙', '🍩', '🥯'],
}

export function Hanukkah({ intensity = 'medium' }: HanukkahProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const lastSpawnRef = useRef(0)

  const getIntensityMultiplier = useCallback(() => {
    const multipliers = { low: 0.5, medium: 1, high: 1.5 }
    return multipliers[intensity]
  }, [intensity])

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const rand = Math.random()
    let type: 'menorah' | 'dreidel' | 'star' | 'candle' | 'gelt'
    let emoji: string
    let size: number
    let spinSpeed: number

    if (rand < 0.1) {
      type = 'menorah'
      emoji = hanukkahEmojis.menorahs[0]
      size = 45 + Math.random() * 20
      spinSpeed = 0
    } else if (rand < 0.3) {
      type = 'dreidel'
      emoji = hanukkahEmojis.dreidels[0]
      size = 30 + Math.random() * 15
      spinSpeed = 5 + Math.random() * 10
    } else if (rand < 0.55) {
      type = 'star'
      emoji = hanukkahEmojis.stars[Math.floor(Math.random() * hanukkahEmojis.stars.length)]
      size = 20 + Math.random() * 20
      spinSpeed = 0
    } else if (rand < 0.75) {
      type = 'candle'
      emoji = hanukkahEmojis.candles[0]
      size = 25 + Math.random() * 15
      spinSpeed = 0
    } else {
      type = 'gelt'
      emoji = hanukkahEmojis.gelt[Math.floor(Math.random() * hanukkahEmojis.gelt.length)]
      size = 25 + Math.random() * 15
      spinSpeed = 3 + Math.random() * 5
    }

    return {
      x: Math.random() * canvas.width,
      y: -40,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 0.5 + Math.random() * 1.2,
      size,
      life: 1,
      type,
      emoji,
      rotation: Math.random() * 360,
      rotationSpeed: spinSpeed,
      glowPhase: Math.random() * Math.PI * 2,
      spinSpeed,
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
    const spawnInterval = Math.max(150, 350 - 100 * intensityMultiplier)
    const maxParticles = Math.floor(45 * intensityMultiplier)

    const animate = () => {
      const now = Date.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn particles
      if (now - lastSpawnRef.current > spawnInterval && particlesRef.current.length < maxParticles) {
        particlesRef.current.push(createParticle(canvas))
        lastSpawnRef.current = now
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.glowPhase += 0.05

        // Dreidels spin fast, others gentle movement
        if (particle.type === 'dreidel') {
          particle.rotation += particle.rotationSpeed
          particle.spinSpeed *= 0.998 // Slow down gradually
          particle.rotationSpeed = particle.spinSpeed
        } else if (particle.type === 'gelt') {
          particle.rotation += particle.rotationSpeed
        } else {
          particle.rotation += Math.sin(particle.glowPhase) * 0.5
        }

        // Gentle swaying
        particle.x += Math.sin(particle.glowPhase) * 0.4

        // Fade near bottom
        if (particle.y > canvas.height * 0.75) {
          particle.life -= 0.015
        }

        const isVisible = particle.life > 0 && particle.y > -50 && particle.y < canvas.height + 50

        if (isVisible && particle.emoji) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.globalAlpha = particle.life

          // Apply rotation only for spinning items
          if (particle.type === 'dreidel' || particle.type === 'gelt') {
            ctx.rotate((particle.rotation * Math.PI) / 180)
          }

          // Glow effects
          if (particle.type === 'menorah' || particle.type === 'candle') {
            const glow = 0.6 + Math.sin(particle.glowPhase * 2) * 0.4
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 20 * glow
          } else if (particle.type === 'star') {
            const twinkle = 0.7 + Math.sin(particle.glowPhase * 3) * 0.3
            ctx.shadowColor = '#4169E1'
            ctx.shadowBlur = 12 * twinkle
          }

          // Scale effect for stars
          let scale = 1
          if (particle.type === 'star') {
            scale = 0.85 + Math.sin(particle.glowPhase * 2) * 0.2
          }

          ctx.font = `${particle.size * scale}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(particle.emoji, 0, 0)
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
      className="fixed inset-0 pointer-events-none z-40"
      style={{ background: 'transparent' }}
    />
  )
}
