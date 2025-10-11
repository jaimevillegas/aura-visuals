// components/visualizers/PlasmaEffect.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgb, lerpColor } from '@/lib/utils/colorUtils'

export function PlasmaEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { sensitivity, activePalette } = useVisualizerStore()
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
    let time = 0

    const render = () => {
      const { low, mid, high } = useAudioStore.getState().frequencyData

      time += 0.03 + mid * 0.1

      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data

      // Parámetros del plasma basados en audio
      const speed1 = time * (1 + low * sensitivity)
      const speed2 = time * 0.7 * (1 + high * sensitivity)
      const speed3 = time * 0.5 * (1 + mid * sensitivity)

      const scale = 50 / (1 + low * 0.5 * sensitivity)

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          // Algoritmo de plasma clásico
          const value1 = Math.sin((x / scale) + speed1)
          const value2 = Math.sin((y / scale) + speed2)
          const value3 = Math.sin(((x + y) / scale) + speed3)
          const value4 = Math.sin((Math.sqrt(x * x + y * y) / scale) + speed1)

          const plasma = (value1 + value2 + value3 + value4) / 4

          // Mapear valor del plasma (-1 a 1) a índice de color (0 a 1)
          const colorValue = (plasma + 1) / 2

          // Seleccionar color de la paleta
          const paletteIndex = colorValue * (palette.length - 1)
          const colorIndex = Math.floor(paletteIndex)
          const nextColorIndex = Math.min(colorIndex + 1, palette.length - 1)
          const lerpFactor = paletteIndex - colorIndex

          const color1 = palette[colorIndex]
          const color2 = palette[nextColorIndex]
          const finalColorHex = lerpColor(color1, color2, lerpFactor)
          const finalColor = hexToRgb(finalColorHex)

          // Modulación de brillo con audio
          const brightness = 0.5 + (low + mid + high) * 0.3 * sensitivity

          const index = (y * canvas.width + x) * 4
          data[index] = finalColor.r * brightness
          data[index + 1] = finalColor.g * brightness
          data[index + 2] = finalColor.b * brightness
          data[index + 3] = 255
        }
      }

      ctx.putImageData(imageData, 0, 0)

      // Overlay de partículas flotantes
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < 30; i++) {
        const angle = (time + i) * 0.5
        const radius = 100 + Math.sin(time + i) * 50
        const x = canvas.width / 2 + Math.cos(angle) * radius
        const y = canvas.height / 2 + Math.sin(angle) * radius
        const size = 3 + Math.sin(time * 2 + i) * 2

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${high * 0.5})`)
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size * 3, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [sensitivity, activePalette, palette])

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
