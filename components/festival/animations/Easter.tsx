'use client'

import { useEffect, useRef, useCallback } from 'react'

interface EasterProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rotation: number
  rotationSpeed: number
  life: number
  emoji: string
  bouncePhase: number
  type: 'egg' | 'bunny' | 'flower' | 'butterfly'
}

const easterEmojis = {
  eggs: ['🥚', '🪺', '🐣', '🎨'],
  bunnies: ['🐰', '🐇', '🐾'],
  flowers: ['🌸', '🌺', '🌷', '🌼', '🌻', '💐', '🌹'],
  butterflies: ['🦋', '🐝', '🐞', '✨'],
}

const pastelColors = ['#FFB6C1', '#98FB98', '#DDA0DD', '#F0E68C', '#87CEEB', '#FFDAB9', '#E6E6FA', '#B0E0E6']

export function Easter({ intensity = 'medium' }: EasterProps) {
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
    let type: 'egg' | 'bunny' | 'flower' | 'butterfly'
    let emoji: string

    if (rand < 0.3) {
      type = 'egg'
      emoji = easterEmojis.eggs[Math.floor(Math.random() * easterEmojis.eggs.length)]
    } else if (rand < 0.45) {
      type = 'bunny'
      emoji = easterEmojis.bunnies[Math.floor(Math.random() * easterEmojis.bunnies.length)]
    } else if (rand < 0.75) {
      type = 'flower'
      emoji = easterEmojis.flowers[Math.floor(Math.random() * easterEmojis.flowers.length)]
    } else {
      type = 'butterfly'
      emoji = easterEmojis.butterflies[Math.floor(Math.random() * easterEmojis.butterflies.length)]
    }

    const fromBottom = type === 'bunny' || (type === 'flower' && Math.random() > 0.5)

    return {
      x: Math.random() * canvas.width,
      y: fromBottom ? canvas.height + 30 : -30,
      vx: (Math.random() - 0.5) * 1.5,
      vy: fromBottom ? -(1 + Math.random() * 2) : (0.5 + Math.random() * 1.5),
      size: 25 + Math.random() * 20,
      rotation: (Math.random() - 0.5) * 20,
      rotationSpeed: type === 'butterfly' ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 2,
      life: 1,
      emoji,
      bouncePhase: Math.random() * Math.PI * 2,
      type,
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
    const spawnInterval = Math.max(80, 200 - 60 * intensityMultiplier)
    const maxParticles = Math.floor(50 * intensityMultiplier)

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
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationSpeed
        particle.bouncePhase += 0.08

        // Different behaviors per type
        if (particle.type === 'bunny') {
          // Bunnies hop up
          particle.vy += 0.02 // slight gravity
          if (particle.vy > 0) particle.vy = -2 // bounce back up
        } else if (particle.type === 'butterfly') {
          // Butterflies flutter erratically
          particle.vx += (Math.random() - 0.5) * 0.3
          particle.vy += (Math.random() - 0.5) * 0.2
          particle.vx *= 0.98
        } else if (particle.type === 'flower') {
          // Flowers drift gently
          particle.x += Math.sin(particle.bouncePhase) * 0.5
        } else {
          // Eggs fall with wobble
          particle.x += Math.sin(particle.bouncePhase) * 0.8
          particle.vy += 0.02
        }

        // Fade based on position
        if (particle.vy > 0 && particle.y > canvas.height * 0.75) {
          particle.life -= 0.02
        } else if (particle.vy < 0 && particle.y < canvas.height * 0.25) {
          particle.life -= 0.02
        }

        const isVisible = particle.life > 0 &&
                         particle.y > -50 && particle.y < canvas.height + 50 &&
                         particle.x > -50 && particle.x < canvas.width + 50

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          // Bounce scale for bunnies
          let scale = 1
          if (particle.type === 'bunny') {
            scale = 1 + Math.abs(Math.sin(particle.bouncePhase)) * 0.15
          } else if (particle.type === 'butterfly') {
            scale = 1 + Math.sin(particle.bouncePhase * 3) * 0.1
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
