// components/visualizers/GeometricMandala.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

export function GeometricMandala() {
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
      const params = getVisualizerParams('geometricmandala')
      const petalCount = params.petalCount || 12
      const layers = params.layers || 4
      const sensitivity = params.sensitivity || 1.0
      const rotationSpeed = params.rotationSpeed || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Clear background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.35

      rotation += (0.003 + mid * 0.01) * rotationSpeed

      ctx.save()
      ctx.translate(centerX, centerY)

      // Draw multiple layers
      for (let layer = 0; layer < layers; layer++) {
        const layerProgress = (layer + 1) / layers
        const layerRadius = maxRadius * layerProgress

        // Get frequency for this layer
        const freqIndex = Math.floor(layerProgress * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        ctx.save()
        ctx.rotate(rotation * (1 + layer * 0.3))

        // Draw geometric petals
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2

          ctx.save()
          ctx.rotate(angle)

          // Draw petal shape
          const petalLength = layerRadius + freqValue * 30 * sensitivity
          const petalWidth = layerRadius * 0.3

          ctx.beginPath()

          // Draw leaf/petal shape using bezier curves
          ctx.moveTo(0, 0)
          ctx.quadraticCurveTo(
            petalWidth / 2, petalLength / 3,
            0, petalLength
          )
          ctx.quadraticCurveTo(
            -petalWidth / 2, petalLength / 3,
            0, 0
          )
          ctx.closePath()

          // Gradient fill
          const gradient = ctx.createLinearGradient(0, 0, 0, petalLength)
          const colorIndex = (layer + i) % palette.length
          gradient.addColorStop(0, hexToRgba(palette[colorIndex], 0.1))
          gradient.addColorStop(0.5, hexToRgba(palette[colorIndex], 0.4 + freqValue * 0.4))
          gradient.addColorStop(1, hexToRgba(palette[(colorIndex + 1) % palette.length], 0.2))

          ctx.fillStyle = gradient
          ctx.fill()

          // Outline
          ctx.strokeStyle = hexToRgba(palette[colorIndex], 0.6 + freqValue * 0.4)
          ctx.lineWidth = 1 + freqValue * 2
          ctx.stroke()

          ctx.restore()
        }

        // Draw connecting circle
        ctx.beginPath()
        ctx.arc(0, 0, layerRadius * 0.8, 0, Math.PI * 2)
        const colorIndex = layer % palette.length
        ctx.strokeStyle = hexToRgba(palette[colorIndex], 0.3 + freqValue * 0.3)
        ctx.lineWidth = 1
        ctx.stroke()

        ctx.restore()
      }

      ctx.restore()

      // Draw decorative dots at petal tips
      for (let i = 0; i < petalCount * 2; i++) {
        const angle = (i / (petalCount * 2)) * Math.PI * 2 + rotation
        const distance = maxRadius * (1 + high * 0.2)
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance

        const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, 8)
        dotGradient.addColorStop(0, hexToRgba(palette[i % palette.length], 0.8))
        dotGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = dotGradient
        ctx.beginPath()
        ctx.arc(x, y, 3 + high * 5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Central ornament
      const ornamentSize = 25 + low * 25 * sensitivity
      for (let i = 0; i < 3; i++) {
        const radius = ornamentSize * (1 - i * 0.3)
        const ornamentGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
        ornamentGradient.addColorStop(0, hexToRgba('#ffffff', 0.8))
        ornamentGradient.addColorStop(0.5, hexToRgba(palette[i], 0.6))
        ornamentGradient.addColorStop(1, hexToRgba(palette[i], 0))

        ctx.fillStyle = ornamentGradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.fill()
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
