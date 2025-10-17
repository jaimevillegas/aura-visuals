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

  // Smoothed values for each bar
  const smoothedValuesRef = useRef<number[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ajustar tamaño del canvas
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
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

      // Initialize smoothed values array if needed
      if (smoothedValuesRef.current.length !== barCount) {
        smoothedValuesRef.current = new Array(barCount).fill(0)
      }

      const barWidth = (canvas.width / barCount) * (1 - barSpacing)
      const barGap = (canvas.width / barCount) * barSpacing

      // Use only lower frequencies for better visual effect (first half to 3/4 of data)
      const usableDataLength = Math.floor(rawData.length * 0.75)
      const dataPointsPerBar = Math.floor(usableDataLength / barCount)

      for (let i = 0; i < barCount; i++) {
        // Calcular promedio de frecuencias para esta barra
        const start = i * dataPointsPerBar
        const end = start + dataPointsPerBar
        const dataChunk = rawData.slice(start, Math.min(end, usableDataLength))

        if (dataChunk.length === 0) continue

        // Calculate average with proper validation
        const sum = dataChunk.reduce((acc, val) => acc + (val || 0), 0)
        const average = sum / dataChunk.length
        let normalizedValue = Math.min(average / 255, 1.0)

        // Apply logarithmic scale for better visual distribution
        normalizedValue = Math.pow(normalizedValue, 0.8)

        // Apply smoothing
        const targetValue = normalizedValue * sensitivity
        smoothedValuesRef.current[i] = smoothedValuesRef.current[i] * smoothing + targetValue * (1 - smoothing)

        // Calculate bar height (max 90% of canvas height)
        const maxHeight = canvas.height * 0.9
        const barHeight = Math.max(2, smoothedValuesRef.current[i] * maxHeight)

        const x = i * (barWidth + barGap)
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
        gradient.addColorStop(0, multiplyColor(finalColor, 0.3))
        gradient.addColorStop(0.5, finalColor)
        gradient.addColorStop(1, multiplyColor(finalColor, 1.8))

        // Draw main bar
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, barHeight)

        // Borde brillante en la parte superior
        if (barHeight > 5) {
          ctx.fillStyle = multiplyColor(finalColor, 2.5)
          ctx.fillRect(x, y, barWidth, Math.min(4, barHeight * 0.1))
        }
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
