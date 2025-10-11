// components/visualizers/FractalRings.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

export function FractalRings() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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
    let rotation = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('fractalrings')
      const ringCount = params.ringCount || 8
      const sensitivity = params.sensitivity || 1.0
      const rotationSpeed = params.rotationSpeed || 1.0
      const pulseIntensity = params.pulseIntensity || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Clear with fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.4

      rotation += (0.005 + mid * 0.02) * rotationSpeed

      // Draw expanding fractal rings
      for (let ring = 0; ring < ringCount; ring++) {
        const ringProgress = ring / ringCount
        const baseRadius = maxRadius * ringProgress

        // Get frequency for this ring
        const freqIndex = Math.floor(ringProgress * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        const radiusBoost = freqValue * 50 * sensitivity * pulseIntensity
        const radius = baseRadius + radiusBoost

        // Number of segments in this ring (increases with size)
        const segments = 4 + ring * 4

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(rotation * (1 + ring * 0.2))

        // Draw geometric pattern
        ctx.beginPath()
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()

        // Color based on ring position and frequency
        const colorIndex = ring % palette.length
        const alpha = 0.5 + freqValue * 0.4
        ctx.strokeStyle = hexToRgba(palette[colorIndex], alpha)
        ctx.lineWidth = 2 + freqValue * 3

        ctx.stroke()

        // Add inner glow
        ctx.strokeStyle = hexToRgba(palette[colorIndex], alpha * 0.5)
        ctx.lineWidth = 4 + freqValue * 5
        ctx.globalAlpha = 0.3
        ctx.stroke()
        ctx.globalAlpha = 1

        // Draw connecting lines to create fractal pattern
        if (ring > 0 && ring < ringCount) {
          const prevRadius = maxRadius * ((ring - 1) / ringCount)
          for (let i = 0; i < segments; i += 2) {
            const angle = (i / segments) * Math.PI * 2
            const x1 = Math.cos(angle) * prevRadius
            const y1 = Math.sin(angle) * prevRadius
            const x2 = Math.cos(angle) * radius
            const y2 = Math.sin(angle) * radius

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = hexToRgba(palette[colorIndex], alpha * 0.3)
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        ctx.restore()
      }

      // Central bright core
      const coreSize = 15 + low * 30 * sensitivity
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize)
      coreGradient.addColorStop(0, hexToRgba('#ffffff', 0.8))
      coreGradient.addColorStop(0.5, hexToRgba(palette[0], 0.6))
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
      ctx.fill()

      // Outer pulse rings
      for (let i = 0; i < 3; i++) {
        const pulseRadius = maxRadius * (1.1 + i * 0.15) * (1 + high * 0.1)
        const pulseAlpha = (1 - i / 3) * 0.2 * high

        ctx.strokeStyle = hexToRgba(palette[i % palette.length], pulseAlpha)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
        ctx.stroke()
      }

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
