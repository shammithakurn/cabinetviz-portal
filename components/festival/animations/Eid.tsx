'use client'

import { useEffect, useRef, useCallback } from 'react'

interface EidProps {
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
  type: 'crescent' | 'star' | 'lantern' | 'mosque' | 'decoration'
  emoji?: string
  rotation: number
  rotationSpeed: number
  glowPhase: number
  twinkleSpeed: number
}

const eidEmojis = {
  crescents: ['🌙', '☪️'],
  stars: ['⭐', '🌟', '✨', '💫'],
  lanterns: ['🏮', '🕯️'],
  mosques: ['🕌'],
  decorations: ['🎊', '🎉', '🎁', '🍬', '🍭', '🧁'],
}

const eidColors = ['#1E8449', '#27AE60', '#2ECC71', '#FFD700', '#F4D03F', '#FFFFFF', '#C0C0C0']

export function Eid({ intensity = 'medium' }: EidProps) {
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
    let type: 'crescent' | 'star' | 'lantern' | 'mosque' | 'decoration'
    let emoji: string
    let startY: number
    let vy: number
    let size: number

    if (rand < 0.15) {
      type = 'crescent'
      emoji = eidEmojis.crescents[Math.floor(Math.random() * eidEmojis.crescents.length)]
      startY = -40
      vy = 0.5 + Math.random() * 0.8
      size = 35 + Math.random() * 25
    } else if (rand < 0.45) {
      type = 'star'
      emoji = eidEmojis.stars[Math.floor(Math.random() * eidEmojis.stars.length)]
      startY = -30
      vy = 0.8 + Math.random() * 1.2
      size = 20 + Math.random() * 20
    } else if (rand < 0.6) {
      type = 'lantern'
      emoji = eidEmojis.lanterns[Math.floor(Math.random() * eidEmojis.lanterns.length)]
      startY = canvas.height + 30
      vy = -(0.6 + Math.random() * 0.8)
      size = 28 + Math.random() * 18
    } else if (rand < 0.7) {
      type = 'mosque'
      emoji = eidEmojis.mosques[0]
      startY = canvas.height + 40
      vy = -(0.5 + Math.random() * 0.6)
      size = 40 + Math.random() * 20
    } else {
      type = 'decoration'
      emoji = eidEmojis.decorations[Math.floor(Math.random() * eidEmojis.decorations.length)]
      startY = -30
      vy = 1.0 + Math.random() * 1.5
      size = 22 + Math.random() * 18
    }

    return {
      x: Math.random() * canvas.width,
      y: startY,
      vx: (Math.random() - 0.5) * 0.5,
      vy,
      size,
      color: eidColors[Math.floor(Math.random() * eidColors.length)],
      life: 1,
      type,
      emoji,
      rotation: (Math.random() - 0.5) * 15,
      rotationSpeed: (Math.random() - 0.5) * 1,
      glowPhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.05 + Math.random() * 0.05,
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
        particle.rotation += particle.rotationSpeed
        particle.glowPhase += particle.twinkleSpeed

        // Gentle floating motion
        particle.x += Math.sin(particle.glowPhase) * 0.3

        // Fade based on direction - faster fade for upward elements
        if (particle.vy > 0 && particle.y > canvas.height * 0.7) {
          particle.life -= 0.02
        } else if (particle.vy < 0 && particle.y < canvas.height * 0.35) {
          particle.life -= 0.025
        }

        const isVisible = particle.life > 0 && particle.y > -60 && particle.y < canvas.height + 60

        if (isVisible && particle.emoji) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          // Special effects based on type
          if (particle.type === 'crescent' || particle.type === 'star') {
            const glow = 0.6 + Math.sin(particle.glowPhase) * 0.4
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 15 * glow
          } else if (particle.type === 'lantern') {
            const glow = 0.7 + Math.sin(particle.glowPhase * 2) * 0.3
            ctx.shadowColor = '#FFA500'
            ctx.shadowBlur = 12 * glow
          } else if (particle.type === 'mosque') {
            ctx.shadowColor = '#27AE60'
            ctx.shadowBlur = 10
          }

          // Twinkle effect for stars
          let scale = 1
          if (particle.type === 'star') {
            scale = 0.8 + Math.sin(particle.glowPhase * 2) * 0.3
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
      className="fixed inset-0 pointer-events-none z-[45]"
      style={{ background: 'transparent' }}
    />
  )
}
