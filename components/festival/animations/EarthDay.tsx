'use client'

import { useEffect, useRef, useCallback } from 'react'

interface EarthDayProps {
  intensity?: 'low' | 'medium' | 'high'
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  type: 'earth' | 'plant' | 'animal' | 'nature' | 'recycle'
  emoji: string
  rotation: number
  rotationSpeed: number
  floatPhase: number
  pulsePhase: number
}

const earthDayEmojis = {
  earths: ['🌍', '🌎', '🌏', '🌐'],
  plants: ['🌱', '🌿', '🍀', '🌲', '🌳', '🪴', '🌴'],
  animals: ['🐝', '🦋', '🐦', '🐢', '🐬', '🦜', '🐞'],
  nature: ['💧', '☀️', '🌈', '💨', '⛰️', '🏔️'],
  recycle: ['♻️', '💚', '🌻', '🍃'],
}

export function EarthDay({ intensity = 'medium' }: EarthDayProps) {
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
    let type: 'earth' | 'plant' | 'animal' | 'nature' | 'recycle'
    let emoji: string
    let size: number
    let vy: number
    let startY: number

    if (rand < 0.12) {
      type = 'earth'
      emoji = earthDayEmojis.earths[Math.floor(Math.random() * earthDayEmojis.earths.length)]
      size = 35 + Math.random() * 25
      startY = -50
      vy = 0.5 + Math.random() * 0.7
    } else if (rand < 0.35) {
      type = 'plant'
      emoji = earthDayEmojis.plants[Math.floor(Math.random() * earthDayEmojis.plants.length)]
      size = 25 + Math.random() * 20
      startY = canvas.height + 30
      vy = -(0.6 + Math.random() * 0.8)
    } else if (rand < 0.55) {
      type = 'animal'
      emoji = earthDayEmojis.animals[Math.floor(Math.random() * earthDayEmojis.animals.length)]
      size = 24 + Math.random() * 18
      // Animals fly in from sides or bottom
      if (Math.random() > 0.5) {
        startY = canvas.height + 30
        vy = -(0.8 + Math.random() * 1.0)
      } else {
        startY = -30
        vy = 0.7 + Math.random() * 1.0
      }
    } else if (rand < 0.75) {
      type = 'nature'
      emoji = earthDayEmojis.nature[Math.floor(Math.random() * earthDayEmojis.nature.length)]
      size = 24 + Math.random() * 20
      startY = -35
      vy = 0.4 + Math.random() * 0.8
    } else {
      type = 'recycle'
      emoji = earthDayEmojis.recycle[Math.floor(Math.random() * earthDayEmojis.recycle.length)]
      size = 26 + Math.random() * 18
      startY = -35
      vy = 0.5 + Math.random() * 0.8
    }

    return {
      x: Math.random() * canvas.width,
      y: startY,
      vx: (Math.random() - 0.5) * 0.8,
      vy,
      size,
      life: 1,
      type,
      emoji,
      rotation: type === 'earth' ? 0 : (Math.random() - 0.5) * 20,
      rotationSpeed: type === 'earth' ? 0.5 : (Math.random() - 0.5) * 2,
      floatPhase: Math.random() * Math.PI * 2,
      pulsePhase: Math.random() * Math.PI * 2,
    }
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
    const spawnInterval = Math.max(160, 320 - 80 * intensityMultiplier)
    const maxParticles = Math.floor(38 * intensityMultiplier)

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
        particle.pulsePhase += 0.06

        // Earth rotates steadily
        if (particle.type === 'earth') {
          particle.rotation += 0.3
        }

        // Animals and butterflies flutter
        if (particle.type === 'animal') {
          particle.vx += (Math.random() - 0.5) * 0.15
          particle.vx *= 0.97
          particle.x += Math.sin(particle.floatPhase * 2) * 1
        } else {
          // Others sway gently
          particle.x += Math.sin(particle.floatPhase) * 0.4
        }

        // Fade based on position
        if (particle.vy > 0 && particle.y > canvas.height * 0.7) {
          particle.life -= 0.02
        } else if (particle.vy < 0 && particle.y < canvas.height * 0.35) {
          particle.life -= 0.025
        }

        const isVisible = particle.life > 0 && particle.y > -60 && particle.y < canvas.height + 60

        if (isVisible) {
          ctx.save()
          ctx.translate(particle.x, particle.y)
          ctx.rotate((particle.rotation * Math.PI) / 180)
          ctx.globalAlpha = particle.life

          // Glow effects
          if (particle.type === 'earth') {
            const pulse = 0.7 + Math.sin(particle.pulsePhase) * 0.3
            ctx.shadowColor = '#00FF00'
            ctx.shadowBlur = 15 * pulse
          } else if (particle.type === 'plant' || particle.type === 'recycle') {
            ctx.shadowColor = '#32CD32'
            ctx.shadowBlur = 8
          } else if (particle.type === 'nature') {
            ctx.shadowColor = '#87CEEB'
            ctx.shadowBlur = 10
          }

          // Pulse effect for recycling symbol
          let scale = 1
          if (particle.emoji === '♻️') {
            scale = 0.9 + Math.sin(particle.pulsePhase * 2) * 0.15
          } else if (particle.type === 'animal') {
            scale = 0.95 + Math.sin(particle.floatPhase * 3) * 0.08
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
