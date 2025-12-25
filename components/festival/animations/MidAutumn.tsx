'use client'

import { useEffect, useRef, useCallback } from 'react'

interface MidAutumnProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  type: 'moon' | 'lantern' | 'mooncake' | 'rabbit' | 'star'
  emoji: string
  rotation: number
  glowPhase: number
  floatPhase: number
}

const midAutumnEmojis = {
  moons: ['🌕', '🌙'],
  lanterns: ['🏮', '🪔'],
  mooncakes: ['🥮', '🍡'],
  rabbits: ['🐰', '🐇'],
  stars: ['⭐', '🌟', '✨', '💫'],
}

export function MidAutumn({ intensity = 'medium' }: MidAutumnProps) {
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
    let type: 'moon' | 'lantern' | 'mooncake' | 'rabbit' | 'star'
    let emoji: string
    let startY: number
    let vy: number
    let size: number

    if (rand < 0.1) {
      type = 'moon'
      emoji = midAutumnEmojis.moons[Math.floor(Math.random() * midAutumnEmojis.moons.length)]
      startY = -50
      vy = 0.4 + Math.random() * 0.5
      size = 45 + Math.random() * 25
    } else if (rand < 0.4) {
      type = 'lantern'
      emoji = midAutumnEmojis.lanterns[Math.floor(Math.random() * midAutumnEmojis.lanterns.length)]
      startY = canvas.height + 40
      vy = -(0.7 + Math.random() * 0.9)
      size = 30 + Math.random() * 20
    } else if (rand < 0.55) {
      type = 'mooncake'
      emoji = midAutumnEmojis.mooncakes[Math.floor(Math.random() * midAutumnEmojis.mooncakes.length)]
      startY = -30
      vy = 0.5 + Math.random() * 0.8
      size = 28 + Math.random() * 15
    } else if (rand < 0.7) {
      type = 'rabbit'
      emoji = midAutumnEmojis.rabbits[Math.floor(Math.random() * midAutumnEmojis.rabbits.length)]
      startY = -30
      vy = 0.6 + Math.random() * 0.8
      size = 30 + Math.random() * 18
    } else {
      type = 'star'
      emoji = midAutumnEmojis.stars[Math.floor(Math.random() * midAutumnEmojis.stars.length)]
      startY = -25
      vy = 0.4 + Math.random() * 0.8
      size = 18 + Math.random() * 18
    }

    return {
      x: Math.random() * canvas.width,
      y: startY,
      vx: (Math.random() - 0.5) * 0.5,
      vy,
      size,
      life: 1,
      type,
      emoji,
      rotation: (Math.random() - 0.5) * 15,
      glowPhase: Math.random() * Math.PI * 2,
      floatPhase: Math.random() * Math.PI * 2,
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
    const spawnInterval = Math.max(180, 380 - 100 * intensityMultiplier)
    const maxParticles = Math.floor(35 * intensityMultiplier)

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
        particle.glowPhase += 0.03
        particle.floatPhase += 0.02

        // Gentle floating motion
        particle.x += Math.sin(particle.floatPhase) * 0.4

        // Lanterns sway more
        if (particle.type === 'lantern') {
          particle.rotation = Math.sin(particle.floatPhase * 1.5) * 8
        }

        // Rabbits hop
        if (particle.type === 'rabbit') {
          particle.y += Math.abs(Math.sin(particle.floatPhase * 3)) * 0.5
        }

        // Fade based on direction
        if (particle.vy > 0 && particle.y > canvas.height * 0.7) {
          particle.life -= 0.02
        } else if (particle.vy < 0 && particle.y < canvas.height * 0.3) {
          particle.life -= 0.025
        }

        const isVisible = particle.life > 0 && particle.y > -60 && particle.y < canvas.height + 60

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          // Glow effects
          if (particle.type === 'moon') {
            const moonGlow = 0.7 + Math.sin(particle.glowPhase) * 0.3
            ctx.shadowColor = '#FFE4B5'
            ctx.shadowBlur = 30 * moonGlow
          } else if (particle.type === 'lantern') {
            const lanternGlow = 0.6 + Math.sin(particle.glowPhase * 2) * 0.4
            ctx.shadowColor = '#FF6600'
            ctx.shadowBlur = 15 * lanternGlow
          } else if (particle.type === 'star') {
            const starTwinkle = 0.6 + Math.sin(particle.glowPhase * 3) * 0.4
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 10 * starTwinkle
          }

          // Scale effect for rabbits hopping
          let scale = 1
          if (particle.type === 'rabbit') {
            scale = 1 + Math.abs(Math.sin(particle.floatPhase * 3)) * 0.1
          } else if (particle.type === 'star') {
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
