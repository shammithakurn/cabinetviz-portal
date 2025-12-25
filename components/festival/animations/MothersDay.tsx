'use client'

import { useEffect, useRef, useCallback } from 'react'

interface MothersDayProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  type: 'heart' | 'flower' | 'gift' | 'butterfly'
  emoji: string
  rotation: number
  rotationSpeed: number
  floatPhase: number
  pulsePhase: number
}

const mothersDayEmojis = {
  hearts: ['💕', '💗', '💖', '💝', '❤️', '🩷'],
  flowers: ['🌹', '🌷', '🌸', '💐', '🌺', '🪻', '🌻'],
  gifts: ['🎁', '💎', '👑', '💌'],
  butterflies: ['🦋', '✨', '💫'],
}

export function MothersDay({ intensity = 'medium' }: MothersDayProps) {
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
    let type: 'heart' | 'flower' | 'gift' | 'butterfly'
    let emoji: string
    let size: number

    if (rand < 0.35) {
      type = 'heart'
      emoji = mothersDayEmojis.hearts[Math.floor(Math.random() * mothersDayEmojis.hearts.length)]
      size = 22 + Math.random() * 20
    } else if (rand < 0.7) {
      type = 'flower'
      emoji = mothersDayEmojis.flowers[Math.floor(Math.random() * mothersDayEmojis.flowers.length)]
      size = 25 + Math.random() * 22
    } else if (rand < 0.85) {
      type = 'gift'
      emoji = mothersDayEmojis.gifts[Math.floor(Math.random() * mothersDayEmojis.gifts.length)]
      size = 26 + Math.random() * 18
    } else {
      type = 'butterfly'
      emoji = mothersDayEmojis.butterflies[Math.floor(Math.random() * mothersDayEmojis.butterflies.length)]
      size = 20 + Math.random() * 18
    }

    const fromBottom = type === 'butterfly' || Math.random() > 0.8

    return {
      x: Math.random() * canvas.width,
      y: fromBottom ? canvas.height + 30 : -35,
      vx: (Math.random() - 0.5) * 0.8,
      vy: fromBottom ? -(0.4 + Math.random() * 0.6) : (0.5 + Math.random() * 1),
      size,
      life: 1,
      type,
      emoji,
      rotation: (Math.random() - 0.5) * 20,
      rotationSpeed: (Math.random() - 0.5) * 2,
      floatPhase: Math.random() * Math.PI * 2,
      pulsePhase: Math.random() * Math.PI * 2,
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
        particle.floatPhase += 0.03
        particle.pulsePhase += 0.08

        // Gentle swaying
        particle.x += Math.sin(particle.floatPhase) * 0.6

        // Butterflies flutter
        if (particle.type === 'butterfly') {
          particle.vx += (Math.random() - 0.5) * 0.15
          particle.vx *= 0.98
        }

        // Fade based on direction
        if (particle.vy > 0 && particle.y > canvas.height * 0.75) {
          particle.life -= 0.015
        } else if (particle.vy < 0 && particle.y < canvas.height * 0.2) {
          particle.life -= 0.015
        }

        const isVisible = particle.life > 0 && particle.y > -50 && particle.y < canvas.height + 50

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          // Soft pink glow for hearts
          if (particle.type === 'heart') {
            const pulse = 0.6 + Math.sin(particle.pulsePhase) * 0.4
            ctx.shadowColor = '#FF69B4'
            ctx.shadowBlur = 12 * pulse
          } else if (particle.type === 'flower') {
            ctx.shadowColor = '#FFB6C1'
            ctx.shadowBlur = 8
          } else if (particle.type === 'gift') {
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 10
          }

          // Pulse effect for hearts
          let scale = 1
          if (particle.type === 'heart') {
            scale = 0.9 + Math.sin(particle.pulsePhase) * 0.15
          } else if (particle.type === 'butterfly') {
            scale = 0.9 + Math.sin(particle.floatPhase * 4) * 0.1
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
