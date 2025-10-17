// components/visualizers/CircularWaveform.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

export function CircularWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
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

    let animationFrameId: number
    let rotation = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('circularwaveform')
      const radius = params.radius || 150
      const sensitivity = params.sensitivity || 1.0
      const lineThickness = params.lineThickness || 2
      const rotationSpeed = params.rotationSpeed || 0.5

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Fondo con fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.25

      rotation += 0.005 * rotationSpeed

      // Número de capas de waveform
      const layers = 3

      for (let layer = 0; layer < layers; layer++) {
        const layerOffset = layer / layers
        const layerRadius = baseRadius * (1 + layerOffset * 0.5)

        ctx.beginPath()
        ctx.lineWidth = 3 - layer

        const points = Math.min(rawData.length, 256)
        for (let i = 0; i < points; i++) {
          const progress = i / points
          const freqIndex = Math.floor(progress * (rawData.length / 2))
          const freqValue = (rawData[freqIndex] || 0) / 255

          const angle = progress * Math.PI * 2 + rotation * (layer + 1)
          const boost = freqValue * 100 * sensitivity
          const radiusWithBoost = layerRadius + boost

          const x = centerX + Math.cos(angle) * radiusWithBoost
          const y = centerY + Math.sin(angle) * radiusWithBoost

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.closePath()

        // Gradiente de color para cada capa
        const paletteColor = palette[layer % palette.length]
        const gradient = ctx.createLinearGradient(
          centerX - layerRadius,
          centerY - layerRadius,
          centerX + layerRadius,
          centerY + layerRadius
        )

        gradient.addColorStop(0, hexToRgba(paletteColor, 0.8))
        gradient.addColorStop(0.5, hexToRgba(paletteColor, 0.5))
        gradient.addColorStop(1, hexToRgba(paletteColor, 0.8))

        ctx.strokeStyle = gradient
        ctx.stroke()

        // Efecto de relleno sutil
        ctx.globalAlpha = 0.1
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.globalAlpha = 1
      }

      // Anillos concéntricos pulsantes
      for (let i = 0; i < 5; i++) {
        const ringRadius = baseRadius * (0.3 + i * 0.15) * (1 + low * 0.3 * sensitivity)
        const alpha = (1 - i / 5) * 0.5

        ctx.strokeStyle = hexToRgba(palette[i % palette.length], alpha)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Partículas que orbitan
      const particleCount = 20
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + rotation * 3
        const radius = baseRadius + Math.sin(rotation * 5 + i) * 30
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        const size = 2 + high * 4 * sensitivity

        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
        particleGradient.addColorStop(0, '#ffffff')
        particleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = particleGradient
        ctx.beginPath()
        ctx.arc(x, y, size * 2, 0, Math.PI * 2)
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
        width: '100%',
        height: '100%',
        background: '#000',
      }}
    />
  )
}
