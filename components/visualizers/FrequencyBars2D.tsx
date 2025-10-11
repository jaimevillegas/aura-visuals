// components/visualizers/FrequencyBars2D.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { lerpColor, multiplyColor } from '@/lib/utils/colorUtils'

export function FrequencyBars2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activePalette, getVisualizerParams } = useVisualizerStore()
  const palette = COLOR_PALETTES[activePalette]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationFrameId: number
    let time = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('bars2d')
      const barCount = params.barCount || 64
      const sensitivity = params.sensitivity || 1.0
      const barSpacing = params.barSpacing || 0.2
      const smoothing = params.smoothing || 0.5

      time += 0.016
      const { rawData } = useAudioStore.getState().frequencyData

      // Fondo negro sólido
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const barWidth = canvas.width / barCount
      const dataPointsPerBar = Math.floor(rawData.length / 2 / barCount)

      for (let i = 0; i < barCount; i++) {
        // Calcular promedio de frecuencias para esta barra
        const start = i * dataPointsPerBar
        const end = start + dataPointsPerBar
        const dataChunk = rawData.slice(start, Math.min(end, rawData.length / 2))

        if (dataChunk.length === 0) continue

        const average = dataChunk.reduce((a, b) => a + b, 0) / dataChunk.length
        const normalizedValue = average / 255

        // Altura de la barra con boost para frecuencias altas
        const boost = 1 + (i / barCount) * 2
        const barHeight = normalizedValue * boost * canvas.height * 0.8 * sensitivity

        const x = i * barWidth
        const y = canvas.height - barHeight

        // Gradiente vertical para cada barra
        const gradient = ctx.createLinearGradient(x, canvas.height, x, y)

        // Usar colores de la paleta con ciclo animado
        const progress = (i / barCount + time * 0.1) % 1
        const paletteIndex = progress * (palette.length - 1)
        const colorIndex = Math.floor(paletteIndex)
        const nextColorIndex = Math.min(colorIndex + 1, palette.length - 1)
        const lerpFactor = paletteIndex - colorIndex

        const color1 = palette[colorIndex]
        const color2 = palette[nextColorIndex]
        const finalColor = lerpColor(color1, color2, lerpFactor)

        // Gradiente de oscuro a brillante
        const brightnessFactor = 1.5
        gradient.addColorStop(0, multiplyColor(finalColor, 0.5))
        gradient.addColorStop(0.5, finalColor)
        gradient.addColorStop(1, multiplyColor(finalColor, 1 + brightnessFactor))

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth - 2, barHeight)

        // Borde brillante en la parte superior
        ctx.fillStyle = multiplyColor(finalColor, 2)
        ctx.fillRect(x, y, barWidth - 2, 3)

        // Reflejo
        ctx.globalAlpha = 0.2
        ctx.save()
        ctx.scale(1, -1)
        ctx.translate(0, -canvas.height)
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth - 2, barHeight * 0.5)
        ctx.restore()
        ctx.globalAlpha = 1
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
