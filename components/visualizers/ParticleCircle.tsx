// components/visualizers/ParticleCircle.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { lerpColor, multiplyColor, hexToRgba } from '@/lib/utils/colorUtils'

export function ParticleCircle() {
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
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let animationFrameId: number
    let rotation = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('particlecircle')
      const particleCount = params.particleCount || 150
      const sensitivity = params.sensitivity || 1.0
      const particleSize = params.particleSize || 1.0
      const rotationSpeed = params.rotationSpeed || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Fondo con fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.25

      // Rotación basada en frecuencias medias (controlado por rotationSpeed)
      rotation += (0.5 + mid * 2) * 0.02 * rotationSpeed

      // Dibujar partículas en círculo
      for (let i = 0; i < particleCount; i++) {
        const progress = i / particleCount
        const angle = (Math.PI * 2 * progress) + rotation

        // Obtener valor de frecuencia para esta partícula
        const freqIndex = Math.floor(progress * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        // Radio dinámico basado en audio
        const radiusOffset = freqValue * 150 * sensitivity
        const radius = baseRadius + radiusOffset

        // Posición
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        // Tamaño de partícula basado en frecuencia (controlado por particleSize)
        const baseParticleSize = 2 + freqValue * 8 * sensitivity
        const finalParticleSize = baseParticleSize * particleSize

        // Color de la paleta
        const paletteIndex = progress * (palette.length - 1)
        const colorIndex = Math.floor(paletteIndex)
        const nextColorIndex = Math.min(colorIndex + 1, palette.length - 1)
        const lerpFactor = paletteIndex - colorIndex

        const color1 = palette[colorIndex]
        const color2 = palette[nextColorIndex]
        const finalColor = lerpColor(color1, color2, lerpFactor)

        // Dibujar partícula con glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, finalParticleSize * 2)
        gradient.addColorStop(0, finalColor)
        gradient.addColorStop(0.5, multiplyColor(finalColor, 0.5))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, finalParticleSize * 2, 0, Math.PI * 2)
        ctx.fill()

        // Núcleo brillante
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(x, y, finalParticleSize * 0.3, 0, Math.PI * 2)
        ctx.fill()

        // Líneas conectoras (efecto kaleidoscope)
        if (i > 0 && freqValue > 0.3) {
          const prevProgress = (i - 1) / particleCount
          const prevAngle = (Math.PI * 2 * prevProgress) + rotation
          const prevFreqIndex = Math.floor(prevProgress * (rawData.length / 2))
          const prevFreqValue = (rawData[prevFreqIndex] || 0) / 255
          const prevRadius = baseRadius + prevFreqValue * 150 * sensitivity

          const prevX = centerX + Math.cos(prevAngle) * prevRadius
          const prevY = centerY + Math.sin(prevAngle) * prevRadius

          ctx.strokeStyle = hexToRgba(finalColor, 0.3)
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(prevX, prevY)
          ctx.lineTo(x, y)
          ctx.stroke()
        }
      }

      // Círculo central pulsante
      const centralPulse = baseRadius * (0.8 + low * 0.4 * sensitivity)

      const centralGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centralPulse)
      centralGradient.addColorStop(0, `rgba(255, 255, 255, ${low * 0.5})`)
      centralGradient.addColorStop(0.5, hexToRgba(palette[0], low * 0.3))
      centralGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = centralGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, centralPulse, 0, Math.PI * 2)
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
