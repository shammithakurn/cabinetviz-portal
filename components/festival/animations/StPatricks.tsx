'use client'

import { useEffect, useRef, useCallback } from 'react'

interface StPatricksProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  type: 'shamrock' | 'rainbow' | 'gold' | 'leprechaun' | 'beer'
  emoji: string
  rotation: number
  rotationSpeed: number
  bouncePhase: number
  sparkle: number
}

const stPatricksEmojis = {
  shamrocks: ['☘️', '🍀'],
  rainbows: ['🌈'],
  gold: ['🪙', '💰', '✨', '⭐'],
  leprechauns: ['🎩', '🧙‍♂️'],
  beer: ['🍺', '🍻', '🥃'],
}

export function StPatricks({ intensity = 'medium' }: StPatricksProps) {
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
    let type: 'shamrock' | 'rainbow' | 'gold' | 'leprechaun' | 'beer'
    let emoji: string
    let size: number

    if (rand < 0.4) {
      type = 'shamrock'
      emoji = stPatricksEmojis.shamrocks[Math.floor(Math.random() * stPatricksEmojis.shamrocks.length)]
      size = 25 + Math.random() * 20
    } else if (rand < 0.5) {
      type = 'rainbow'
      emoji = stPatricksEmojis.rainbows[0]
      size = 35 + Math.random() * 20
    } else if (rand < 0.7) {
      type = 'gold'
      emoji = stPatricksEmojis.gold[Math.floor(Math.random() * stPatricksEmojis.gold.length)]
      size = 22 + Math.random() * 18
    } else if (rand < 0.85) {
      type = 'leprechaun'
      emoji = stPatricksEmojis.leprechauns[Math.floor(Math.random() * stPatricksEmojis.leprechauns.length)]
      size = 30 + Math.random() * 18
    } else {
      type = 'beer'
      emoji = stPatricksEmojis.beer[Math.floor(Math.random() * stPatricksEmojis.beer.length)]
      size = 28 + Math.random() * 15
    }

    // Gold coins come from a pot at the end of rainbow (sides)
    const isGoldFromSide = type === 'gold' && Math.random() > 0.5
    const startX = isGoldFromSide
      ? (Math.random() > 0.5 ? 0 : canvas.width)
      : Math.random() * canvas.width

    return {
      x: startX,
      y: -40,
      vx: isGoldFromSide ? (startX === 0 ? 2 : -2) + (Math.random() - 0.5) : (Math.random() - 0.5) * 1,
      vy: type === 'gold' && isGoldFromSide ? 1.5 + Math.random() : 0.8 + Math.random() * 1.3,
      size,
      life: 1,
      type,
      emoji,
      rotation: (Math.random() - 0.5) * 20,
      rotationSpeed: type === 'gold' ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 2,
      bouncePhase: Math.random() * Math.PI * 2,
      sparkle: 0,
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
    const spawnInterval = Math.max(100, 220 - 70 * intensityMultiplier)
    const maxParticles = Math.floor(50 * intensityMultiplier)

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
        particle.bouncePhase += 0.05
        particle.sparkle += 0.1

        // Shamrocks flutter gently
        if (particle.type === 'shamrock') {
          particle.x += Math.sin(particle.bouncePhase) * 0.8
          particle.rotation += Math.sin(particle.bouncePhase * 2) * 0.5
        }

        // Gold coins tumble and sparkle
        if (particle.type === 'gold') {
          particle.vy += 0.03 // gravity
        }

        // Leprechaun hats bounce
        if (particle.type === 'leprechaun') {
          particle.y += Math.sin(particle.bouncePhase * 2) * 0.3
        }

        // Fade near bottom
        if (particle.y > canvas.height * 0.75) {
          particle.life -= 0.018
        }

        const isVisible = particle.life > 0 && particle.y > -50 && particle.y < canvas.height + 50 &&
                         particle.x > -50 && particle.x < canvas.width + 50

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          // Green glow for shamrocks
          if (particle.type === 'shamrock') {
            ctx.shadowColor = '#00FF00'
            ctx.shadowBlur = 10
          }

          // Gold sparkle effect
          if (particle.type === 'gold') {
            const sparkleIntensity = 0.5 + Math.sin(particle.sparkle * 3) * 0.5
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 15 * sparkleIntensity
          }

          // Rainbow glow
          if (particle.type === 'rainbow') {
            ctx.shadowColor = '#FF69B4'
            ctx.shadowBlur = 12
          }

          // Scale effect for gold
          let scale = 1
          if (particle.type === 'gold') {
            scale = 0.9 + Math.sin(particle.sparkle * 2) * 0.15
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
