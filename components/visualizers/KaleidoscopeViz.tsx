// components/visualizers/KaleidoscopeViz.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

export function KaleidoscopeViz() {
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
      const params = getVisualizerParams('kaleidoscope')
      const segments = params.segments || 8
      const rayCount = params.rayCount || 50
      const rayLength = params.rayLength || 0.7
      const rotationSpeed = params.rotationSpeed || 1.0
      const glowIntensity = params.glowIntensity || 1.0
      const centralPulse = params.centralPulse || 1.0
      const ringCount = params.ringCount || 3
      const trailFade = params.trailFade || 0.05
      const sensitivity = params.sensitivity || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Fondo con trail fade personalizable
      ctx.fillStyle = `rgba(0, 0, 0, ${trailFade})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.5

      // Incrementar rotación basada en mid frequencies
      rotation += (0.01 + mid * 0.05) * rotationSpeed

      ctx.save()
      ctx.translate(centerX, centerY)

      // Dibujar cada segmento con simetría
      for (let seg = 0; seg < segments * 2; seg++) {
        ctx.save()

        // Rotar al ángulo del segmento
        const angle = (Math.PI * 2 / (segments * 2)) * seg + rotation
        ctx.rotate(angle)

        // Simetría especular para efecto kaleidoscopio
        if (seg % 2 === 1) {
          ctx.scale(1, -1)
        }

        // Dibujar rayos radiales basados en frecuencias
        for (let i = 0; i < rayCount; i++) {
          const progress = i / rayCount
          const freqIndex = Math.floor(progress * (rawData.length / 2))
          const freqValue = (rawData[freqIndex] || 0) / 255

          // Calcular posición del rayo
          const rayAngle = progress * Math.PI * 0.5 // Solo 1/4 del círculo
          const distance = maxRadius * (0.3 + freqValue * rayLength * sensitivity)

          const x = Math.cos(rayAngle) * distance
          const y = Math.sin(rayAngle) * distance

          // Color basado en frecuencia
          const colorIndex = Math.floor(progress * (palette.length - 1))
          const color = palette[colorIndex]

          // Intensidad basada en audio
          const intensity = 0.3 + freqValue * 0.7 * glowIntensity
          const alpha = intensity * (0.5 + high * 0.5)

          // Dibujar línea radial
          ctx.strokeStyle = hexToRgba(color, alpha)
          ctx.lineWidth = 1 + freqValue * 3 * sensitivity
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(x, y)
          ctx.stroke()

          // Punto brillante al final
          if (freqValue > 0.3) {
            const pointSize = 3 + freqValue * 5 * glowIntensity
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, pointSize * 2)
            gradient.addColorStop(0, hexToRgba(color, alpha))
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(x, y, pointSize, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        ctx.restore()
      }

      ctx.restore()

      // Círculo central pulsante (controlado por centralPulse)
      const centralSize = (20 + low * 40 * sensitivity) * centralPulse
      const centralGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centralSize)
      centralGradient.addColorStop(0, hexToRgba(palette[0], 0.8))
      centralGradient.addColorStop(0.5, hexToRgba(palette[1], 0.4))
      centralGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = centralGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, centralSize, 0, Math.PI * 2)
      ctx.fill()

      // Anillos concéntricos pulsantes (número controlado por ringCount)
      for (let ring = 1; ring <= ringCount; ring++) {
        const ringRadius = maxRadius * (0.3 + ring * 0.15) * (1 + mid * 0.2)
        const alpha = (1 - ring / (ringCount + 1)) * 0.3

        ctx.strokeStyle = hexToRgba(palette[ring % palette.length], alpha)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
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
