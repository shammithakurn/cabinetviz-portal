'use client'

import { useEffect, useRef, useCallback } from 'react'

interface PatrioticProps {
  intensity?: 'low' | 'medium' | 'high'
  colors?: string[]
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  type: 'ribbon' | 'star' | 'firework' | 'confetti' | 'spark' | 'balloon'
  emoji?: string
  rotation: number
  rotationSpeed: number
  wavePhase: number
  width?: number
  height?: number
}

// Universal celebration emojis (no flags - they don't render well on all systems)
const celebrationEmojis = ['⭐', '✨', '🎆', '🎇', '🎊', '🎉', '🎈', '🎀', '🏆', '🌟', '💫']

export function Patriotic({
  intensity = 'medium',
  colors = ['#B22234', '#FFFFFF', '#3C3B6E']
}: PatrioticProps) {
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
    let type: 'ribbon' | 'star' | 'firework' | 'confetti' | 'balloon'
    let emoji: string | undefined
    let size: number
    let width: number | undefined
    let height: number | undefined

    if (rand < 0.2) {
      // Colored ribbons/streamers - these use the country colors
      type = 'ribbon'
      size = 0
      width = 8 + Math.random() * 6
      height = 40 + Math.random() * 30
    } else if (rand < 0.4) {
      // Stars with glow in country colors
      type = 'star'
      size = 20 + Math.random() * 15
    } else if (rand < 0.55) {
      type = 'firework'
      emoji = celebrationEmojis[Math.floor(Math.random() * 4)] // First 4 are firework-like
      size = 28 + Math.random() * 18
    } else if (rand < 0.75) {
      type = 'confetti'
      emoji = celebrationEmojis[4 + Math.floor(Math.random() * (celebrationEmojis.length - 4))]
      size = 22 + Math.random() * 16
    } else {
      type = 'balloon'
      emoji = '🎈'
      size = 30 + Math.random() * 15
    }

    return {
      x: Math.random() * canvas.width,
      y: type === 'balloon' ? canvas.height + 40 : -40,
      vx: (Math.random() - 0.5) * 1.5,
      vy: type === 'balloon' ? -(0.8 + Math.random() * 1.2) : (0.8 + Math.random() * 1.5),
      size,
      width,
      height,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      type,
      emoji,
      rotation: (Math.random() - 0.5) * 30,
      rotationSpeed: (Math.random() - 0.5) * 3,
      wavePhase: Math.random() * Math.PI * 2,
    }
  }, [colors])

  const createFireworkBurst = useCallback((x: number, y: number): Particle[] => {
    const particles: Particle[] = []
    // Use all country colors in the burst
    const numPerColor = Math.ceil(30 / colors.length)

    colors.forEach((color, colorIndex) => {
      for (let i = 0; i < numPerColor; i++) {
        const angle = (Math.PI * 2 * (colorIndex * numPerColor + i)) / (colors.length * numPerColor)
        const speed = 2 + Math.random() * 3
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 4,
          color,
          life: 1,
          type: 'spark',
          rotation: 0,
          rotationSpeed: 0,
          wavePhase: 0,
        })
      }
    })
    return particles
  }, [colors])

  // Draw a 5-pointed star shape
  const drawStar = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
      const outerRadius = size / 2
      const innerRadius = size / 4

      if (i === 0) {
        ctx.moveTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
      } else {
        ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius)
      }

      const innerAngle = angle + (2 * Math.PI) / 10
      ctx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius)
    }
    ctx.closePath()
    ctx.fill()
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
    const spawnInterval = Math.max(80, 180 - 60 * intensityMultiplier)
    const fireworkInterval = Math.max(1200, 2500 - 700 * intensityMultiplier)
    const maxParticles = Math.floor(70 * intensityMultiplier)

    const animate = () => {
      const now = Date.now()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn particles
      if (now - lastSpawnRef.current > spawnInterval && particlesRef.current.length < maxParticles) {
        particlesRef.current.push(createParticle(canvas))
        lastSpawnRef.current = now
      }

      // Create firework bursts
      if (now - lastFireworkRef.current > fireworkInterval) {
        const x = canvas.width * 0.2 + Math.random() * canvas.width * 0.6
        const y = canvas.height * 0.15 + Math.random() * canvas.height * 0.3
        particlesRef.current.push(...createFireworkBurst(x, y))
        lastFireworkRef.current = now
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.wavePhase += 0.05

        if (particle.type === 'spark') {
          particle.vy += 0.06
          particle.vx *= 0.97
          particle.life -= 0.025

          if (particle.life > 0) {
            ctx.save()
            ctx.globalAlpha = particle.life
            ctx.fillStyle = particle.color
            ctx.shadowColor = particle.color
            ctx.shadowBlur = 10
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
          }
          return particle.life > 0
        }

        // Non-spark particles
        particle.rotation += particle.rotationSpeed

        // Waving effect for ribbons
        if (particle.type === 'ribbon') {
          particle.x += Math.sin(particle.wavePhase * 3) * 1.5
        } else {
          particle.x += Math.sin(particle.wavePhase) * 0.6
        }

        // Balloon floats up with slight wobble
        if (particle.type === 'balloon') {
          particle.x += Math.sin(particle.wavePhase * 2) * 0.8
          if (particle.y < canvas.height * 0.1) {
            particle.life -= 0.015
          }
        } else if (particle.y > canvas.height * 0.75) {
          particle.life -= 0.018
        }

        const isVisible = particle.life > 0 && particle.y > -60 && particle.y < canvas.height + 60

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          if (particle.type === 'ribbon' && particle.width && particle.height) {
            // Draw colored ribbon/streamer
            ctx.fillStyle = particle.color
            ctx.shadowColor = particle.color
            ctx.shadowBlur = 5

            // Wavy ribbon shape
            ctx.beginPath()
            const waveOffset = Math.sin(particle.wavePhase * 4) * 5
            ctx.moveTo(-particle.width / 2, -particle.height / 2)
            ctx.quadraticCurveTo(
              waveOffset, 0,
              -particle.width / 2, particle.height / 2
            )
            ctx.lineTo(particle.width / 2, particle.height / 2)
            ctx.quadraticCurveTo(
              particle.width / 2 + waveOffset, 0,
              particle.width / 2, -particle.height / 2
            )
            ctx.closePath()
            ctx.fill()
          } else if (particle.type === 'star') {
            // Draw colored star shape
            ctx.fillStyle = particle.color
            ctx.shadowColor = particle.color
            ctx.shadowBlur = 15
            drawStar(ctx, particle.size)
          } else if (particle.emoji) {
            // Draw emoji
            if (particle.type === 'firework') {
              ctx.shadowColor = particle.color
              ctx.shadowBlur = 12
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
  }, [createParticle, createFireworkBurst, getIntensityMultiplier, drawStar])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45]"
      style={{ background: 'transparent' }}
    />
  )
}
