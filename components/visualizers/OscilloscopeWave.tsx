// components/visualizers/OscilloscopeWave.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'

export function OscilloscopeWave() {
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

    // Get custom parameters for this visualizer
    const params = getVisualizerParams('oscilloscope')
    const sensitivity = params.sensitivity || 1.0
    const trailLength = params.trailLength || 0.5
    const waveAmplitude = params.waveAmplitude || 1.0

    let animationFrameId: number
    let hueOffset = 0

    const render = () => {
      const { rawData } = useAudioStore.getState().frequencyData

      // Fondo con efecto de desvanecimiento (controlado por trailLength)
      const fadeAmount = 0.05 + trailLength * 0.3
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAmount})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerY = canvas.height / 2
      const sliceWidth = canvas.width / rawData.length

      // Incrementar hue para efecto rainbow
      hueOffset = (hueOffset + 1) % 360

      // Dibujar onda
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = 0; i < rawData.length; i++) {
        const value = rawData[i] / 255
        const y = centerY + (value - 0.5) * canvas.height * sensitivity * waveAmplitude

        const x = i * sliceWidth

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      // Usar colores de la paleta
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
      palette.forEach((color, index) => {
        gradient.addColorStop(index / (palette.length - 1), color)
      })

      ctx.strokeStyle = gradient
      ctx.stroke()

      // Efecto de reflejo
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.scale(1, -1)
      ctx.translate(0, -canvas.height)
      ctx.strokeStyle = gradient
      ctx.stroke()
      ctx.restore()

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
