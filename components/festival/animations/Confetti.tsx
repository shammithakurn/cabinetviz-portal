'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ConfettiProps {
  intensity?: 'low' | 'medium' | 'high'
  colors?: string[]
}

interface ConfettiPiece {
  x: number
  y: number
  vx: number
  vy: number
  rotation: number
  rotationSpeed: number
  color: string
  width: number
  height: number
  life: number
}

const defaultColors = [
  '#FF1493', '#FFD700', '#00FF00', '#00BFFF', '#FF4500',
  '#9400D3', '#FF6347', '#7FFF00', '#DC143C', '#FF69B4',
  '#4169E1', '#32CD32', '#FF8C00', '#BA55D3', '#20B2AA',
]

export function Confetti({ intensity = 'medium', colors = defaultColors }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<ConfettiPiece[]>([])
  const animationRef = useRef<number>()
  const lastSpawnRef = useRef(0)
  const [isVisible, setIsVisible] = useState(true)

  const spawnInterval = intensity === 'low' ? 150 : intensity === 'medium' ? 80 : 40
  const maxPieces = intensity === 'low' ? 100 : intensity === 'medium' ? 200 : 350

  const createConfetti = useCallback((canvas: HTMLCanvasElement): ConfettiPiece => {
    return {
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      width: 6 + Math.random() * 6,
      height: 10 + Math.random() * 10,
      life: 1,
    }
  }, [colors])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const now = Date.now()

    // Spawn new confetti
    if (now - lastSpawnRef.current > spawnInterval && confettiRef.current.length < maxPieces) {
      confettiRef.current.push(createConfetti(canvas))
      lastSpawnRef.current = now
    }

    // Update and draw confetti
    confettiRef.current = confettiRef.current.filter((piece) => {
      // Update physics
      piece.x += piece.vx
      piece.y += piece.vy
      piece.vy += 0.05 // Gravity
      piece.vx += (Math.random() - 0.5) * 0.2 // Wind
      piece.rotation += piece.rotationSpeed

      // Fade out as it falls
      if (piece.y > canvas.height * 0.7) {
        piece.life -= 0.02
      }

      // Draw piece
      if (piece.life > 0 && piece.y < canvas.height + 50) {
        ctx.save()
        ctx.translate(piece.x, piece.y)
        ctx.rotate((piece.rotation * Math.PI) / 180)
        ctx.globalAlpha = piece.life
        ctx.fillStyle = piece.color

        // Draw a rectangle (confetti shape)
        ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height)

        // Add shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width / 2, piece.height / 3)

        ctx.restore()
        return true
      }
      return false
    })

    animationRef.current = requestAnimationFrame(draw)
  }, [createConfetti, spawnInterval, maxPieces])

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
