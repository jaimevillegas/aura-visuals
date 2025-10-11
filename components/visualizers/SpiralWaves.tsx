// components/visualizers/SpiralWaves.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

export function SpiralWaves() {
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
      const params = getVisualizerParams('spiralwaves')
      const spiralCount = params.spiralCount || 6
      const sensitivity = params.sensitivity || 1.0
      const rotationSpeed = params.rotationSpeed || 1.0
      const waveAmplitude = params.waveAmplitude || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Fondo con trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      rotation += (0.5 + mid * 2) * 0.01 * rotationSpeed

      // Dibujar múltiples espirales
      for (let spiralIndex = 0; spiralIndex < spiralCount; spiralIndex++) {
        const spiralOffset = (spiralIndex / spiralCount) * Math.PI * 2

        ctx.beginPath()

        const points = 200
        for (let i = 0; i < points; i++) {
          const progress = i / points
          const freqIndex = Math.floor(progress * (rawData.length / 2))
          const freqValue = (rawData[freqIndex] || 0) / 255

          const angle = progress * Math.PI * 8 + rotation + spiralOffset
          const radius = progress * Math.min(canvas.width, canvas.height) * 0.4
          const boost = freqValue * 50 * sensitivity * waveAmplitude

          const x = centerX + Math.cos(angle) * (radius + boost)
          const y = centerY + Math.sin(angle) * (radius + boost)

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        // Color de la paleta
        const paletteColor = palette[spiralIndex % palette.length]
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width / 2)
        gradient.addColorStop(0, hexToRgba(paletteColor, 0.8))
        gradient.addColorStop(1, hexToRgba(paletteColor, 0))

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2 + low * 3
        ctx.stroke()
      }

      // Círculo central pulsante
      const pulseRadius = 20 + low * 50 * sensitivity * waveAmplitude
      const pulseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius)
      pulseGradient.addColorStop(0, `rgba(255, 255, 255, ${low * 0.8})`)
      pulseGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

      ctx.fillStyle = pulseGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
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
