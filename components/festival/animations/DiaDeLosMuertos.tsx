'use client'

import { useEffect, useRef, useCallback } from 'react'

interface DiaDeLosMuertosProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  type: 'skull' | 'flower' | 'candle' | 'butterfly' | 'marigold'
  emoji: string
  rotation: number
  rotationSpeed: number
  floatPhase: number
  glowPhase: number
  color: string
}

const muertosEmojis = {
  skulls: ['💀', '☠️', '🎭'],
  flowers: ['🌺', '🌸', '💐', '🌻'],
  candles: ['🕯️', '🔥'],
  butterflies: ['🦋', '✨', '💫'],
  marigolds: ['🌼', '🏵️'],
}

const muertosColors = ['#FF1493', '#FF4500', '#FFD700', '#9400D3', '#00CED1', '#32CD32']

export function DiaDeLosMuertos({ intensity = 'medium' }: DiaDeLosMuertosProps) {
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
    let type: 'skull' | 'flower' | 'candle' | 'butterfly' | 'marigold'
    let emoji: string
    let size: number
    let startY: number
    let vy: number

    if (rand < 0.2) {
      type = 'skull'
      emoji = muertosEmojis.skulls[Math.floor(Math.random() * muertosEmojis.skulls.length)]
      size = 30 + Math.random() * 22
      startY = -40
      vy = 0.5 + Math.random() * 0.8
    } else if (rand < 0.45) {
      type = 'flower'
      emoji = muertosEmojis.flowers[Math.floor(Math.random() * muertosEmojis.flowers.length)]
      size = 25 + Math.random() * 20
      startY = -35
      vy = 0.6 + Math.random() * 1
    } else if (rand < 0.55) {
      type = 'candle'
      emoji = muertosEmojis.candles[Math.floor(Math.random() * muertosEmojis.candles.length)]
      size = 25 + Math.random() * 18
      startY = canvas.height + 40
      vy = -(0.6 + Math.random() * 0.8)
    } else if (rand < 0.75) {
      type = 'butterfly'
      emoji = muertosEmojis.butterflies[Math.floor(Math.random() * muertosEmojis.butterflies.length)]
      size = 22 + Math.random() * 18
      startY = canvas.height + 30
      vy = -(0.8 + Math.random() * 1.2)
    } else {
      type = 'marigold'
      emoji = muertosEmojis.marigolds[Math.floor(Math.random() * muertosEmojis.marigolds.length)]
      size = 24 + Math.random() * 18
      startY = -30
      vy = 0.7 + Math.random() * 1
    }

    return {
      x: Math.random() * canvas.width,
      y: startY,
      vx: (Math.random() - 0.5) * 1,
      vy,
      size,
      life: 1,
      type,
      emoji,
      rotation: (Math.random() - 0.5) * 30,
      rotationSpeed: type === 'butterfly' ? (Math.random() - 0.5) * 5 : (Math.random() - 0.5) * 2,
      floatPhase: Math.random() * Math.PI * 2,
      glowPhase: Math.random() * Math.PI * 2,
      color: muertosColors[Math.floor(Math.random() * muertosColors.length)],
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
    const spawnInterval = Math.max(150, 300 - 80 * intensityMultiplier)
    const maxParticles = Math.floor(40 * intensityMultiplier)

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
        particle.floatPhase += 0.04
        particle.glowPhase += 0.08

        // Butterflies flutter erratically
        if (particle.type === 'butterfly') {
          particle.vx += (Math.random() - 0.5) * 0.2
          particle.vx *= 0.98
          particle.x += Math.sin(particle.floatPhase * 3) * 1.5
        } else {
          // Others sway gently
          particle.x += Math.sin(particle.floatPhase) * 0.5
        }

        // Fade based on direction
        if (particle.vy > 0 && particle.y > canvas.height * 0.7) {
          particle.life -= 0.02
        } else if (particle.vy < 0 && particle.y < canvas.height * 0.35) {
          particle.life -= 0.025
        }

        const isVisible = particle.life > 0 && particle.y > -50 && particle.y < canvas.height + 50

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          // Colorful glows based on type
          if (particle.type === 'skull') {
            const glowIntensity = 0.5 + Math.sin(particle.glowPhase) * 0.5
            ctx.shadowColor = particle.color
            ctx.shadowBlur = 12 * glowIntensity
          } else if (particle.type === 'candle') {
            const flicker = 0.6 + Math.sin(particle.glowPhase * 4) * 0.4
            ctx.shadowColor = '#FF4500'
            ctx.shadowBlur = 15 * flicker
          } else if (particle.type === 'flower' || particle.type === 'marigold') {
            ctx.shadowColor = '#FFD700'
            ctx.shadowBlur = 8
          } else if (particle.type === 'butterfly') {
            ctx.shadowColor = '#9400D3'
            ctx.shadowBlur = 10
          }

          // Scale effect for butterflies
          let scale = 1
          if (particle.type === 'butterfly') {
            scale = 0.9 + Math.sin(particle.floatPhase * 4) * 0.15
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
