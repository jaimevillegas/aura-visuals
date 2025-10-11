// components/visualizers/RadialWaves.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba, lerpColor } from '@/lib/utils/colorUtils'

export function RadialWaves() {
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
      const params = getVisualizerParams('radialwaves')
      const waveCount = params.waveCount || 6
      const sensitivity = params.sensitivity || 1.0
      const waveAmplitude = params.waveAmplitude || 1.0
      const waveSpeed = params.waveSpeed || 1.0

      const { rawData, low, mid } = useAudioStore.getState().frequencyData

      // Fondo negro
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.2

      rotation += mid * 0.02 * waveSpeed

      const dataPointsPerBar = Math.floor(rawData.length / 2 / waveCount)

      // Dibujar barras radiales
      for (let i = 0; i < waveCount; i++) {
        const start = i * dataPointsPerBar
        const end = start + dataPointsPerBar
        const dataChunk = rawData.slice(start, Math.min(end, rawData.length / 2))

        if (dataChunk.length === 0) continue

        const average = dataChunk.reduce((a, b) => a + b, 0) / dataChunk.length
        const normalizedValue = average / 255

        const angle = (i / waveCount) * Math.PI * 2 + rotation
        const boost = 1 + (i / waveCount) * 2
        const barHeight = normalizedValue * boost * 200 * sensitivity * waveAmplitude

        const innerRadius = baseRadius
        const outerRadius = baseRadius + barHeight

        // Posiciones
        const x1 = centerX + Math.cos(angle) * innerRadius
        const y1 = centerY + Math.sin(angle) * innerRadius
        const x2 = centerX + Math.cos(angle) * outerRadius
        const y2 = centerY + Math.sin(angle) * outerRadius

        // Color de la paleta
        const progress = i / waveCount
        const paletteIndex = progress * (palette.length - 1)
        const colorIndex = Math.floor(paletteIndex)
        const nextColorIndex = Math.min(colorIndex + 1, palette.length - 1)
        const lerpFactor = paletteIndex - colorIndex

        const color1 = palette[colorIndex]
        const color2 = palette[nextColorIndex]
        const finalColor = lerpColor(color1, color2, lerpFactor)

        // Gradiente radial
        const baseOpacity = 0.5
        const endOpacity = 0.9
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
        gradient.addColorStop(0, hexToRgba(finalColor, baseOpacity))
        gradient.addColorStop(1, hexToRgba(finalColor, endOpacity))

        ctx.strokeStyle = gradient
        ctx.lineWidth = (360 / waveCount) - 1
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()

        // Punto brillante al final
        const pointSize = 3
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(x2, y2, pointSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // Círculo central
      const centralPulse = baseRadius * (0.8 + low * 0.3)
      ctx.strokeStyle = hexToRgba(palette[0], 0.5)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, centralPulse, 0, Math.PI * 2)
      ctx.stroke()

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
