// components/visualizers/MeteorShower.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  life: number
  maxLife: number
  trailLength: number
}

export function MeteorShower() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const meteorsRef = useRef<Meteor[]>([])
  const { activePalette, getVisualizerParams } = useVisualizerStore()
  const palette = COLOR_PALETTES[activePalette]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationFrameId: number

    const createMeteor = (): Meteor => {
      // Meteors come from top-right
      const angle = Math.random() * Math.PI / 6 + Math.PI / 4 // 45-75 degrees
      const speed = 8 + Math.random() * 12
      const startX = Math.random() * canvas.width * 1.5
      const startY = -50 - Math.random() * 200

      return {
        x: startX,
        y: startY,
        vx: -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 2 + 1,
        hue: Math.random(),
        life: 0,
        maxLife: 60 + Math.random() * 60,
        trailLength: 30 + Math.random() * 70
      }
    }

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('meteorshower')
      const meteorCount = params.meteorCount || 50
      const sensitivity = params.sensitivity || 1.0
      const meteorSpeed = params.meteorSpeed || 1.0
      const trailLength = params.trailLength || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Clear with trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      // Spawn meteors based on audio
      const spawnRate = Math.floor((1 + high * 10) * sensitivity)
      for (let i = 0; i < spawnRate; i++) {
        if (Math.random() < 0.3 && meteorsRef.current.length < meteorCount * 6) {
          meteorsRef.current.push(createMeteor())
        }
      }

      // Update and draw meteors
      meteorsRef.current = meteorsRef.current.filter((meteor) => {
        meteor.life++

        // Get frequency for this meteor
        const freqIndex = Math.floor(meteor.hue * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        // Gravity and acceleration
        meteor.vy += 0.1 * (1 + low * 0.5)

        // Audio-reactive speed boost
        const speedBoost = (1 + freqValue * sensitivity * 0.5) * meteorSpeed
        meteor.vx *= speedBoost
        meteor.vy *= speedBoost

        // Update position
        meteor.x += meteor.vx
        meteor.y += meteor.vy

        // Life progress
        const lifeProgress = meteor.life / meteor.maxLife
        const lifeFactor = 1 - lifeProgress

        // Size based on frequency and life
        const size = meteor.size * (0.5 + freqValue) * lifeFactor

        // Color
        const colorIndex = Math.floor(meteor.hue * palette.length)
        const color = palette[colorIndex]
        const alpha = lifeFactor * (0.6 + freqValue * 0.4)

        // Draw trail
        const trailSteps = 20
        for (let i = 0; i < trailSteps; i++) {
          const trailProgress = i / trailSteps
          const trailX = meteor.x - meteor.vx * trailProgress * meteor.trailLength * 0.5 * trailLength
          const trailY = meteor.y - meteor.vy * trailProgress * meteor.trailLength * 0.5 * trailLength
          const trailAlpha = alpha * (1 - trailProgress) * 0.6
          const trailSize = size * (1 - trailProgress * 0.7)

          const trailGradient = ctx.createRadialGradient(
            trailX, trailY, 0,
            trailX, trailY, trailSize * 3
          )
          trailGradient.addColorStop(0, hexToRgba(color, trailAlpha))
          trailGradient.addColorStop(0.5, hexToRgba(color, trailAlpha * 0.5))
          trailGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

          ctx.fillStyle = trailGradient
          ctx.beginPath()
          ctx.arc(trailX, trailY, trailSize * 3, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw meteor head
        const headGradient = ctx.createRadialGradient(
          meteor.x, meteor.y, 0,
          meteor.x, meteor.y, size * 5
        )
        headGradient.addColorStop(0, hexToRgba('#ffffff', alpha))
        headGradient.addColorStop(0.2, hexToRgba(color, alpha))
        headGradient.addColorStop(0.6, hexToRgba(color, alpha * 0.5))
        headGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = headGradient
        ctx.beginPath()
        ctx.arc(meteor.x, meteor.y, size * 5, 0, Math.PI * 2)
        ctx.fill()

        // Bright core
        ctx.fillStyle = hexToRgba('#ffffff', alpha * 0.9)
        ctx.beginPath()
        ctx.arc(meteor.x, meteor.y, size, 0, Math.PI * 2)
        ctx.fill()

        // Remove if off screen or life expired
        return (
          meteor.y < canvas.height + 100 &&
          meteor.x > -100 &&
          meteor.life < meteor.maxLife
        )
      })

      // Background stars
      const starCount = 100
      for (let i = 0; i < starCount; i++) {
        const x = (i * 137.5) % canvas.width
        const y = (i * 97.3) % canvas.height
        const twinkle = Math.sin(i + mid * 10) * 0.5 + 0.5
        const alpha = 0.3 + twinkle * 0.3

        ctx.fillStyle = hexToRgba('#ffffff', alpha)
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fill()
      }

      // Atmospheric glow
      const gradientTop = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.3)
      gradientTop.addColorStop(0, hexToRgba(palette[0], mid * 0.1))
      gradientTop.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradientTop
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [activePalette, palette, getVisualizerParams])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#000',
      }}
    />
  )
}
