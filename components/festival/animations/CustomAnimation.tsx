'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AnimationProps {
  size: { min: number; max: number }
  speed: { min: number; max: number }
  rotation: boolean
  rotationSpeed: number
  fade: boolean
  fadeStart: number
  swing: boolean
  swingAmount: number
  density: number
  direction?: 'down' | 'up'
}

interface AnimationElement {
  elementId: string
  weight: number
}

interface AnimationConfig {
  elements: AnimationElement[]
  props: AnimationProps
}

interface CustomAnimationProps {
  intensity?: 'low' | 'medium' | 'high'
  config?: AnimationConfig
  elements?: Array<{
    id: string
    emoji?: string
    name: string
  }>
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  emoji: string
  size: number
  life: number
  swingOffset: number
  swingSpeed: number
}

// Built-in elements with their emojis (subset for client-side fallback)
const BUILTIN_EMOJIS: Record<string, string> = {
  'builtin-0': '🏮', // Lantern
  'builtin-1': '🪔', // Diya
  'builtin-2': '🧨', // Firecracker
  'builtin-3': '🎇', // Sparkler
  'builtin-4': '🎆', // Firework
  'builtin-5': '🎉', // Party Popper
  'builtin-6': '🎊', // Confetti Ball
  'builtin-7': '🎈', // Balloon
  'builtin-8': '🎁', // Gift Box
  'builtin-9': '🧧', // Red Envelope
  'builtin-10': '❄️', // Snowflake
  'builtin-11': '🍂', // Autumn Leaf
  'builtin-12': '🍁', // Maple Leaf
  'builtin-13': '🌸', // Cherry Blossom
  'builtin-14': '🌷', // Tulip
  'builtin-15': '🌻', // Sunflower
  'builtin-16': '🌹', // Rose
  'builtin-17': '💐', // Bouquet
  'builtin-18': '☀️', // Sun
  'builtin-19': '☁️', // Cloud
  'builtin-20': '💧', // Rain Drop
  'builtin-21': '❤️', // Heart
  'builtin-22': '💕', // Pink Heart
  'builtin-23': '💖', // Sparkling Heart
  'builtin-24': '⭐', // Star
  'builtin-25': '🌟', // Glowing Star
  'builtin-26': '🌙', // Crescent Moon
  'builtin-27': '🌠', // Shooting Star
  'builtin-28': '🎀', // Ribbon
  'builtin-29': '👑', // Crown
  'builtin-30': '🏆', // Trophy
  'builtin-31': '🎄', // Christmas Tree
  'builtin-32': '✡️', // Star of David
  'builtin-33': '🕎', // Menorah
  'builtin-34': '🕉️', // Om
  'builtin-35': '✝️', // Cross
  'builtin-36': '⛪', // Church
  'builtin-37': '🕌', // Mosque
  'builtin-38': '🙏', // Praying Hands
  'builtin-39': '👼', // Angel
  'builtin-40': '🔔', // Bell
  'builtin-41': '🎃', // Pumpkin
  'builtin-42': '👻', // Ghost
  'builtin-43': '💀', // Skull
  'builtin-44': '🕷️', // Spider
  'builtin-45': '🦇', // Bat
  'builtin-46': '🥚', // Easter Egg
  'builtin-47': '🐰', // Bunny
  'builtin-48': '🦃', // Turkey
  'builtin-49': '☘️', // Clover
  'builtin-50': '🍀', // Four Leaf Clover
  'builtin-51': '🍬', // Candy Cane
  'builtin-52': '⛄', // Snowman
  'builtin-53': '🎅', // Santa
  'builtin-54': '🎂', // Cake
  'builtin-55': '🍾', // Champagne
  'builtin-56': '🥂', // Wine Glass
  'builtin-57': '🥮', // Moon Cake
  'builtin-58': '🪷', // Rangoli/Lotus
}

// Default fallback emojis if no config provided
const DEFAULT_EMOJIS = ['🎉', '🎊', '⭐', '🌟', '✨']

export function CustomAnimation({ intensity = 'medium', config, elements }: CustomAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const lastSpawnRef = useRef(0)
  const [isVisible, setIsVisible] = useState(true)

  // Get intensity multipliers
  const intensityMultiplier = intensity === 'low' ? 0.5 : intensity === 'high' ? 1.5 : 1

  // Get props from config or use defaults
  const props = config?.props || {
    size: { min: 20, max: 40 },
    speed: { min: 3, max: 8 },
    rotation: true,
    rotationSpeed: 2,
    fade: true,
    fadeStart: 0.8,
    swing: false,
    swingAmount: 20,
    density: 30,
    direction: 'down' as const,
  }

  // Ensure direction has a default value
  const direction = props.direction || 'down'

  const spawnInterval = Math.max(20, 100 - props.density * intensityMultiplier)
  const maxParticles = Math.floor(50 * intensityMultiplier * (props.density / 30))

  // Build emoji list from config
  const getEmojis = useCallback(() => {
    if (config?.elements && config.elements.length > 0) {
      // Build weighted list based on config
      const weightedList: string[] = []
      for (const elem of config.elements) {
        const emoji = elements?.find(e => e.id === elem.elementId)?.emoji ||
                      BUILTIN_EMOJIS[elem.elementId] ||
                      '✨'
        // Add emoji multiple times based on weight
        const count = Math.max(1, Math.floor(elem.weight / 10))
        for (let i = 0; i < count; i++) {
          weightedList.push(emoji)
        }
      }
      return weightedList.length > 0 ? weightedList : DEFAULT_EMOJIS
    }
    return DEFAULT_EMOJIS
  }, [config, elements])

  const createParticle = useCallback((canvas: HTMLCanvasElement): Particle => {
    const emojis = getEmojis()
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]
    const size = props.size.min + Math.random() * (props.size.max - props.size.min)
    const speed = props.speed.min + Math.random() * (props.speed.max - props.speed.min)

    // Start position and velocity based on direction
    const isUp = direction === 'up'
    const startY = isUp ? canvas.height + size : -size
    const velocityY = isUp ? -speed : speed

    return {
      x: Math.random() * canvas.width,
      y: startY,
      vx: (Math.random() - 0.5) * 2,
      vy: velocityY,
      rotation: props.rotation ? Math.random() * 360 : 0,
      rotationSpeed: props.rotation ? (Math.random() - 0.5) * props.rotationSpeed * 2 : 0,
      emoji,
      size,
      life: 1,
      swingOffset: Math.random() * Math.PI * 2,
      swingSpeed: 0.02 + Math.random() * 0.02,
    }
  }, [getEmojis, props, direction])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const now = Date.now()

    // Spawn new particles
    if (now - lastSpawnRef.current > spawnInterval && particlesRef.current.length < maxParticles) {
      particlesRef.current.push(createParticle(canvas))
      lastSpawnRef.current = now
    }

    // Update and draw particles
    const isUp = direction === 'up'

    particlesRef.current = particlesRef.current.filter((particle) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Apply swing effect
      if (props.swing) {
        particle.swingOffset += particle.swingSpeed
        particle.x += Math.sin(particle.swingOffset) * props.swingAmount * 0.1
      }

      // Update rotation
      if (props.rotation) {
        particle.rotation += particle.rotationSpeed
      }

      // Apply gravity/buoyancy and wind based on direction
      if (isUp) {
        // For upward movement, apply slight upward acceleration (buoyancy)
        particle.vy -= 0.01
        // Slow down horizontal drift for rising elements
        particle.vx *= 0.99
      } else {
        // For downward movement, apply gravity
        particle.vy += 0.02
      }
      particle.vx += (Math.random() - 0.5) * 0.1

      // Fade out based on direction
      if (props.fade) {
        if (isUp && particle.y < canvas.height * (1 - props.fadeStart)) {
          particle.life -= 0.02
        } else if (!isUp && particle.y > canvas.height * props.fadeStart) {
          particle.life -= 0.02
        }
      }

      // Check if particle is still visible based on direction
      const isVisible = isUp
        ? (particle.life > 0 && particle.y > -50)
        : (particle.life > 0 && particle.y < canvas.height + 50)

      // Draw particle
      if (isVisible) {
        ctx.save()
        ctx.translate(particle.x, particle.y)

        if (props.rotation) {
          ctx.rotate((particle.rotation * Math.PI) / 180)
        }

        ctx.globalAlpha = particle.life
        ctx.font = `${particle.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(particle.emoji, 0, 0)
        ctx.restore()
        return true
      }
      return false
    })

    animationRef.current = requestAnimationFrame(draw)
  }, [createParticle, spawnInterval, maxParticles, props, direction])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      draw()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw, isVisible])

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[45]"
      style={{ background: 'transparent', visibility: isVisible ? 'visible' : 'hidden' }}
    />
  )
}
