'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ChineseNewYearProps {
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
  type: 'lantern' | 'dragon' | 'coin' | 'firework' | 'spark'
  emoji?: string
  rotation: number
  rotationSpeed: number
  swingPhase: number
  glowPhase: number
}

const cnyEmojis = {
  lanterns: ['🏮', '🧧', '🎏'],
  dragons: ['🐉', '🐲'],
  coins: ['🪙', '💰', '🧧'],
  lucky: ['🎆', '🎇', '✨', '🌟', '💫', '🎊', '🎉'],
}

const redGoldColors = ['#FF0000', '#FFD700', '#FF4500', '#DC143C', '#FF6347', '#FFA500']

export function ChineseNewYear({ intensity = 'medium' }: ChineseNewYearProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const lastSpawnRef = useRef(0)
  const lastFireworkRef = useRef(0)

  const getIntensityMultiplier = useCallback(() => {
    const multipliers = { low: 0.5, medium: 1, high: 1.5 }
    return multipliers[intensity]
  }, [intensity])

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const rand = Math.random()
    let type: 'lantern' | 'dragon' | 'coin' | 'firework'
    let emoji: string
    let startY: number
    let vy: number

    if (rand < 0.35) {
      type = 'lantern'
      emoji = cnyEmojis.lanterns[Math.floor(Math.random() * cnyEmojis.lanterns.length)]
      startY = canvas.height + 30
      vy = -(0.8 + Math.random() * 1.2)
    } else if (rand < 0.5) {
      type = 'dragon'
      emoji = cnyEmojis.dragons[Math.floor(Math.random() * cnyEmojis.dragons.length)]
      startY = Math.random() * canvas.height * 0.5
      vy = (Math.random() - 0.5) * 0.5
    } else if (rand < 0.7) {
      type = 'coin'
      emoji = cnyEmojis.coins[Math.floor(Math.random() * cnyEmojis.coins.length)]
      startY = -30
      vy = 1 + Math.random() * 1.5
    } else {
      type = 'firework'
      emoji = cnyEmojis.lucky[Math.floor(Math.random() * cnyEmojis.lucky.length)]
      startY = -30
      vy = 1 + Math.random() * 2
    }

    return {
      x: Math.random() * canvas.width,
      y: startY,
      vx: type === 'dragon' ? (1 + Math.random()) : (Math.random() - 0.5) * 0.8,
      vy,
      size: type === 'dragon' ? 40 + Math.random() * 20 : 25 + Math.random() * 20,
      color: redGoldColors[Math.floor(Math.random() * redGoldColors.length)],
      life: 1,
      type,
      emoji,
      rotation: 0,
      rotationSpeed: type === 'coin' ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 2,
      swingPhase: Math.random() * Math.PI * 2,
      glowPhase: Math.random() * Math.PI * 2,
    }
  }, [])

  const createFireworkExplosion = useCallback((x: number, y: number): Particle[] => {
    const particles: Particle[] = []
    const color = redGoldColors[Math.floor(Math.random() * redGoldColors.length)]

    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20
      const speed = 2 + Math.random() * 3
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color,
        life: 1,
        type: 'spark',
        rotation: 0,
        rotationSpeed: 0,
        swingPhase: 0,
        glowPhase: 0,
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
    const spawnInterval = Math.max(150, 300 - 80 * intensityMultiplier)
    const fireworkInterval = Math.max(1200, 2800 - 800 * intensityMultiplier)
    const maxParticles = Math.floor(45 * intensityMultiplier)

    const animate = () => {
      const now = Date.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn particles
      if (now - lastSpawnRef.current > spawnInterval && particlesRef.current.length < maxParticles) {
        particlesRef.current.push(createParticle(canvas))
        lastSpawnRef.current = now
      }

      // Create firework explosions
      if (now - lastFireworkRef.current > fireworkInterval) {
        const x = Math.random() * canvas.width
        const y = canvas.height * 0.2 + Math.random() * canvas.height * 0.3
        particlesRef.current.push(...createFireworkExplosion(x, y))
        lastFireworkRef.current = now
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed
        particle.swingPhase += 0.05
        particle.glowPhase += 0.1

        if (particle.type === 'lantern') {
          // Lanterns float up with gentle swing
          particle.x += Math.sin(particle.swingPhase) * 0.8
          if (particle.y < canvas.height * 0.35) {
            particle.life -= 0.025
          }
        } else if (particle.type === 'dragon') {
          // Dragons fly across with undulation
          particle.y += Math.sin(particle.swingPhase * 2) * 1.5
          if (particle.x > canvas.width + 50 || particle.x < -50) {
            return false
          }
        } else if (particle.type === 'coin') {
          // Coins tumble down
          particle.vy += 0.02
          particle.x += Math.sin(particle.swingPhase) * 0.5
          if (particle.y > canvas.height * 0.8) {
            particle.life -= 0.02
          }
        } else if (particle.type === 'firework') {
          particle.vy += 0.03
          if (particle.y > canvas.height * 0.7) {
            particle.life -= 0.02
          }
        } else if (particle.type === 'spark') {
          particle.vy += 0.05
          particle.vx *= 0.98
          particle.life -= 0.02
        }

        const isVisible = particle.life > 0 && particle.y > -50 && particle.y < canvas.height + 50

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          if (particle.type === 'spark') {
            ctx.beginPath()
            ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
            ctx.fillStyle = particle.color
            ctx.shadowColor = particle.color
            ctx.shadowBlur = 10
            ctx.fill()
          } else if (particle.emoji) {
            // Add glow effect for lanterns
            if (particle.type === 'lantern') {
              const glow = 0.5 + Math.sin(particle.glowPhase) * 0.3
              ctx.shadowColor = '#FFD700'
              ctx.shadowBlur = 20 * glow
            }

            ctx.font = `${particle.size}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(particle.emoji, 0, 0)
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
  }, [createParticle, createFireworkExplosion, getIntensityMultiplier])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45]"
      style={{ background: 'transparent' }}
    />
  )
}
