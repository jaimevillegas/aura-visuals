// components/visualizers/StarField.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

interface Star {
  x: number
  y: number
  z: number
  baseSize: number
  hue: number
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const { activePalette, getVisualizerParams } = useVisualizerStore()
  const palette = COLOR_PALETTES[activePalette]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Get custom parameters for this visualizer
    const params = getVisualizerParams('starfield')
    const sensitivity = params.sensitivity || 1.0
    const particleSize = params.particleSize || 1.0
    const rotationSpeed = params.rotationSpeed || 1.0
    const bloomIntensity = params.bloomIntensity || 1.0

    // Initialize stars
    const starCount = 500
    if (starsRef.current.length === 0) {
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: Math.random() * 2000,
          baseSize: Math.random() * 2 + 0.5,
          hue: Math.random()
        })
      }
    }

    let animationFrameId: number
    let rotation = 0

    const render = () => {
      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Clear with trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      rotation += 0.001 * rotationSpeed

      // Move and draw stars
      starsRef.current.forEach((star, index) => {
        // Move star forward (simulate camera movement)
        const speed = 2 + high * 20 * sensitivity
        star.z -= speed

        // Reset star if it goes behind camera
        if (star.z <= 0) {
          star.z = 2000
          star.x = (Math.random() - 0.5) * 2000
          star.y = (Math.random() - 0.5) * 2000
        }

        // Calculate 2D position (perspective projection)
        const scale = 1000 / star.z
        let x = star.x * scale + centerX
        let y = star.y * scale + centerY

        // Apply rotation
        const dx = x - centerX
        const dy = y - centerY
        const rotatedX = dx * Math.cos(rotation * mid) - dy * Math.sin(rotation * mid)
        const rotatedY = dx * Math.sin(rotation * mid) + dy * Math.cos(rotation * mid)
        x = rotatedX + centerX
        y = rotatedY + centerY

        // Skip stars outside viewport
        if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) {
          return
        }

        // Get frequency for this star
        const freqIndex = Math.floor(star.hue * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        // Size based on distance and audio
        const size = (star.baseSize * scale + freqValue * 3 * sensitivity) * particleSize

        // Color from palette
        const colorIndex = Math.floor(star.hue * palette.length)
        const color = palette[colorIndex]

        // Brightness based on frequency and distance
        const brightness = (0.3 + freqValue * 0.7) * bloomIntensity
        const alpha = Math.min(1, scale * brightness * (1 - star.z / 2000))

        // Draw star with glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
        gradient.addColorStop(0, hexToRgba(color, alpha))
        gradient.addColorStop(0.3, hexToRgba(color, alpha * 0.6))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = hexToRgba('#ffffff', alpha * 0.8)
        ctx.beginPath()
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
        ctx.fill()

        // Motion trail for fast-moving stars
        if (freqValue > 0.5) {
          const trailLength = freqValue * 20 * scale
          const prevZ = star.z + speed
          const prevScale = 1000 / prevZ
          const prevX = star.x * prevScale + centerX
          const prevY = star.y * prevScale + centerY

          ctx.beginPath()
          ctx.moveTo(prevX, prevY)
          ctx.lineTo(x, y)
          ctx.strokeStyle = hexToRgba(color, alpha * 0.5)
          ctx.lineWidth = size * 0.5
          ctx.stroke()
        }
      })

      // Draw connecting lines between nearby stars (constellation effect)
      if (low > 0.3) {
        const connectionDistance = 150 * (1 + low)
        starsRef.current.forEach((star1, i) => {
          if (star1.z > 1000) return // Only connect foreground stars

          const scale1 = 1000 / star1.z
          const x1 = star1.x * scale1 + centerX
          const y1 = star1.y * scale1 + centerY

          starsRef.current.slice(i + 1).forEach((star2) => {
            if (star2.z > 1000) return

            const scale2 = 1000 / star2.z
            const x2 = star2.x * scale2 + centerX
            const y2 = star2.y * scale2 + centerY

            const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

            if (dist < connectionDistance) {
              const alpha = (1 - dist / connectionDistance) * low * 0.3
              ctx.beginPath()
              ctx.moveTo(x1, y1)
              ctx.lineTo(x2, y2)
              ctx.strokeStyle = hexToRgba(palette[0], alpha)
              ctx.lineWidth = 1
              ctx.stroke()
            }
          })
        })
      }

      // Central bright spot
      const centralGlow = 40 + mid * 60 * sensitivity
      const centralGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centralGlow)
      centralGradient.addColorStop(0, hexToRgba(palette[0], 0.3))
      centralGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = centralGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, centralGlow, 0, Math.PI * 2)
      ctx.fill()

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
        width: '100%',
        height: '100%',
        background: '#000',
      }}
    />
  )
}
