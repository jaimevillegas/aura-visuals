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

  // Cache for pre-calculated values
  const rayDataCache = useRef<Array<{ angle: number; cos: number; sin: number }>>([])
  const paletteRGBACache = useRef<string[]>([])
  const currentPaletteRef = useRef<string>(activePalette)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
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
      const params = getVisualizerParams('kaleidoscope')
      const segments = params.segments || 8
      const rayCount = params.rayCount || 50
      const rayLength = params.rayLength || 0.7
      const rotationSpeed = params.rotationSpeed || 1.0
      const sensitivity = params.sensitivity || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Fondo con trail fade más agresivo para mejor rendimiento
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      // Re-calculate palette colors if palette changed
      if (currentPaletteRef.current !== activePalette || paletteRGBACache.current.length !== palette.length) {
        currentPaletteRef.current = activePalette
        paletteRGBACache.current = palette.map(color => hexToRgba(color, 1.0))
      }

      // Pre-calculate ray angles and trig values
      if (rayDataCache.current.length !== rayCount) {
        rayDataCache.current = Array.from({ length: rayCount }, (_, i) => {
          const angle = (i / rayCount) * Math.PI * 0.5
          return {
            angle,
            cos: Math.cos(angle),
            sin: Math.sin(angle)
          }
        })
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.5

      // Incrementar rotación basada en mid frequencies
      rotation += (0.01 + mid * 0.05) * rotationSpeed

      const totalSegments = segments * 2
      const segmentAngle = (Math.PI * 2) / totalSegments
      const highBoost = 0.5 + high * 0.5

      ctx.save()
      ctx.translate(centerX, centerY)

      // Dibujar cada segmento con simetría
      for (let seg = 0; seg < totalSegments; seg++) {
        const angle = segmentAngle * seg + rotation
        const flipY = seg % 2 === 1

        ctx.save()
        ctx.rotate(angle)
        if (flipY) ctx.scale(1, -1)

        // Batch drawing with a single path for better performance
        for (let i = 0; i < rayCount; i++) {
          const progress = i / rayCount
          const freqIndex = Math.floor(progress * (rawData.length * 0.5))
          const freqValue = Math.min((rawData[freqIndex] || 0) / 255, 1.0)

          if (freqValue < 0.05) continue // Skip very low values

          const rayData = rayDataCache.current[i]
          const distance = maxRadius * (0.3 + freqValue * rayLength * sensitivity)
          const x = rayData.cos * distance
          const y = rayData.sin * distance

          // Color basado en frecuencia
          const colorIndex = Math.floor(progress * (palette.length - 1))
          const baseColor = paletteRGBACache.current[colorIndex]

          // Intensidad basada en audio
          const intensity = 0.3 + freqValue * 0.7
          const alpha = intensity * highBoost

          // Extract RGB from cached color and apply alpha
          const rgbaColor = baseColor.replace('1)', `${alpha})`)

          // Dibujar línea radial
          ctx.strokeStyle = rgbaColor
          ctx.lineWidth = 1 + freqValue * 2 * sensitivity
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(x, y)
          ctx.stroke()

          // Solo dibujar puntos brillantes en valores muy altos (optimización)
          if (freqValue > 0.5) {
            const pointSize = 2 + freqValue * 3
            ctx.fillStyle = rgbaColor
            ctx.beginPath()
            ctx.arc(x, y, pointSize, 0, Math.PI * 2)
            ctx.fill()
          }
        }

        ctx.restore()
      }

      ctx.restore()

      // Círculo central pulsante simplificado
      const centralSize = 20 + low * 40 * sensitivity
      const centralGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centralSize)

      const color0 = paletteRGBACache.current[0].replace('1)', '0.8)')
      const color1 = paletteRGBACache.current[Math.min(1, palette.length - 1)].replace('1)', '0.4)')

      centralGradient.addColorStop(0, color0)
      centralGradient.addColorStop(0.5, color1)
      centralGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = centralGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, centralSize, 0, Math.PI * 2)
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
