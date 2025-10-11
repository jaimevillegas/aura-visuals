// components/visualizers/TunnelVision.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba, lerpColor } from '@/lib/utils/colorUtils'

export function TunnelVision() {
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
    let zOffset = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('tunnelvision')
      const ringCount = params.ringCount || 30
      const sensitivity = params.sensitivity || 1.0
      const tunnelSpeed = params.tunnelSpeed || 1.0
      const perspective = params.perspective || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Black background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      rotation += (0.01 + mid * 0.05) * tunnelSpeed
      zOffset += (2 + high * 10 * sensitivity) * tunnelSpeed

      // Number of sides for tunnel polygons
      const sides = 8

      // Draw tunnel rings moving toward viewer
      for (let i = 0; i < ringCount; i++) {
        const z = (i * 40 - (zOffset % 40)) / (100 * perspective)
        if (z <= 0) continue

        const scale = perspective / z
        const alpha = Math.min(1, scale * 0.3)

        // Get frequency for this ring
        const freqIndex = Math.floor((i / ringCount) * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        const radius = 50 * scale + freqValue * 30 * sensitivity * scale

        // Color interpolation based on depth
        const colorProgress = (i / ringCount)
        const colorIndex = Math.floor(colorProgress * (palette.length - 1))
        const nextColorIndex = Math.min(colorIndex + 1, palette.length - 1)
        const lerpFactor = (colorProgress * (palette.length - 1)) - colorIndex
        const color = lerpColor(palette[colorIndex], palette[nextColorIndex], lerpFactor)

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(rotation * scale)

        // Draw polygon
        ctx.beginPath()
        for (let side = 0; side <= sides; side++) {
          const angle = (side / sides) * Math.PI * 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          if (side === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()

        // Stroke with audio-reactive intensity
        const lineAlpha = alpha * (0.4 + freqValue * 0.6)
        ctx.strokeStyle = hexToRgba(color, lineAlpha)
        ctx.lineWidth = 2 * scale + freqValue * 2 * scale
        ctx.stroke()

        // Add glow
        if (freqValue > 0.4) {
          ctx.strokeStyle = hexToRgba(color, lineAlpha * 0.5)
          ctx.lineWidth = 4 * scale
          ctx.globalAlpha = 0.5
          ctx.stroke()
          ctx.globalAlpha = 1
        }

        // Connect to previous ring for tunnel effect
        if (i > 0 && scale < 5) {
          const prevZ = ((i - 1) * 40 - (zOffset % 40)) / (100 * perspective)
          if (prevZ > 0) {
            const prevScale = perspective / prevZ
            const prevRadius = 50 * prevScale + freqValue * 30 * sensitivity * prevScale

            for (let side = 0; side < sides; side += 2) {
              const angle = (side / sides) * Math.PI * 2

              const x1 = Math.cos(angle) * prevRadius
              const y1 = Math.sin(angle) * prevRadius
              const x2 = Math.cos(angle) * radius
              const y2 = Math.sin(angle) * radius

              ctx.beginPath()
              ctx.moveTo(x1, y1)
              ctx.lineTo(x2, y2)
              ctx.strokeStyle = hexToRgba(color, lineAlpha * 0.3)
              ctx.lineWidth = 1 * scale
              ctx.stroke()
            }
          }
        }

        ctx.restore()
      }

      // Central vortex
      const vortexSize = 30 + low * 50 * sensitivity
      const vortexGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, vortexSize)
      vortexGradient.addColorStop(0, hexToRgba('#ffffff', 0.8))
      vortexGradient.addColorStop(0.3, hexToRgba(palette[0], 0.6))
      vortexGradient.addColorStop(0.6, hexToRgba(palette[1], 0.3))
      vortexGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = vortexGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, vortexSize, 0, Math.PI * 2)
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
        width: '100vw',
        height: '100vh',
        background: '#000',
      }}
    />
  )
}
