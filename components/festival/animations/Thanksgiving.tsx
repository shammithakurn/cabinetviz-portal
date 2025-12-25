'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ThanksgivingProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  type: 'leaf' | 'turkey' | 'pumpkin' | 'corn' | 'pie'
  emoji: string
  rotation: number
  rotationSpeed: number
  swayPhase: number
  swayAmount: number
  color: string
}

const thanksgivingEmojis = {
  leaves: ['🍂', '🍁', '🍃'],
  turkeys: ['🦃'],
  pumpkins: ['🎃', '🥧'],
  corn: ['🌽', '🥖', '🥐'],
  harvest: ['🌾', '🥕', '🥔', '🍎', '🥧'],
}

const autumnColors = ['#FF6B35', '#D2691E', '#8B4513', '#A0522D', '#CD853F', '#DEB887', '#DAA520']

export function Thanksgiving({ intensity = 'medium' }: ThanksgivingProps) {
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
    let type: 'leaf' | 'turkey' | 'pumpkin' | 'corn' | 'pie'
    let emoji: string
    let size: number
    let swayAmount: number

    if (rand < 0.5) {
      type = 'leaf'
      emoji = thanksgivingEmojis.leaves[Math.floor(Math.random() * thanksgivingEmojis.leaves.length)]
      size = 25 + Math.random() * 20
      swayAmount = 2 + Math.random() * 2
    } else if (rand < 0.65) {
      type = 'turkey'
      emoji = thanksgivingEmojis.turkeys[0]
      size = 35 + Math.random() * 15
      swayAmount = 0.5
    } else if (rand < 0.8) {
      type = 'pumpkin'
      emoji = thanksgivingEmojis.pumpkins[Math.floor(Math.random() * thanksgivingEmojis.pumpkins.length)]
      size = 28 + Math.random() * 18
      swayAmount = 1
    } else if (rand < 0.9) {
      type = 'corn'
      emoji = thanksgivingEmojis.corn[Math.floor(Math.random() * thanksgivingEmojis.corn.length)]
      size = 25 + Math.random() * 15
      swayAmount = 1.2
    } else {
      type = 'pie'
      emoji = thanksgivingEmojis.harvest[Math.floor(Math.random() * thanksgivingEmojis.harvest.length)]
      size = 24 + Math.random() * 16
      swayAmount = 1
    }

    return {
      x: Math.random() * canvas.width,
      y: -40,
      vx: (Math.random() - 0.5) * 0.5,
      vy: type === 'leaf' ? 0.8 + Math.random() * 1.2 : 1 + Math.random() * 1.5,
      size,
      life: 1,
      type,
      emoji,
      rotation: Math.random() * 360,
      rotationSpeed: type === 'leaf' ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 1,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmount,
      color: autumnColors[Math.floor(Math.random() * autumnColors.length)],
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
    const spawnInterval = Math.max(80, 180 - 50 * intensityMultiplier)
    const maxParticles = Math.floor(55 * intensityMultiplier)

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
        particle.swayPhase += 0.03

        // Leaves flutter and sway more dramatically
        if (particle.type === 'leaf') {
          particle.x += Math.sin(particle.swayPhase) * particle.swayAmount
          particle.vy += Math.sin(particle.swayPhase * 2) * 0.02
          // Occasional gusts
          if (Math.random() > 0.995) {
            particle.vx += (Math.random() - 0.5) * 2
          }
        } else {
          // Gentle sway for other items
          particle.x += Math.sin(particle.swayPhase) * particle.swayAmount * 0.3
        }

        // Air resistance
        particle.vx *= 0.99

        // Fade near bottom
        if (particle.y > canvas.height * 0.75) {
          particle.life -= 0.018
        }

        const isVisible = particle.life > 0 && particle.y > -50 && particle.y < canvas.height + 50

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          // Warm glow for harvest items
          if (particle.type === 'pumpkin' || particle.type === 'turkey') {
            ctx.shadowColor = '#FF8C00'
            ctx.shadowBlur = 8
          }

          ctx.font = `${particle.size}px Arial`
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
