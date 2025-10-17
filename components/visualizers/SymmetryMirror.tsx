// components/visualizers/SymmetryMirror.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

export function SymmetryMirror() {
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
    let time = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('symmetrymirror')
      const mirrorSegments = params.mirrorSegments || 4
      const sensitivity = params.sensitivity || 1.0
      const particleSize = params.particleSize || 1.0
      const bloomIntensity = params.bloomIntensity || 1.0

      const { rawData, low, mid } = useAudioStore.getState().frequencyData

      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      time += 0.01

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw 4 quadrants with mirror symmetry
      ctx.save()

      // Quadrant 1 (top-right)
      ctx.save()
      ctx.translate(centerX, centerY)
      drawPattern(ctx, rawData, palette, time, sensitivity)
      ctx.restore()

      // Quadrant 2 (top-left) - mirror X
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(-1, 1)
      drawPattern(ctx, rawData, palette, time, sensitivity)
      ctx.restore()

      // Quadrant 3 (bottom-right) - mirror Y
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(1, -1)
      drawPattern(ctx, rawData, palette, time, sensitivity)
      ctx.restore()

      // Quadrant 4 (bottom-left) - mirror X and Y
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(-1, -1)
      drawPattern(ctx, rawData, palette, time, sensitivity)
      ctx.restore()

      ctx.restore()

      // Central glow
      const glowSize = 30 + low * 50 * sensitivity
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowSize)
      gradient.addColorStop(0, hexToRgba(palette[0], 0.6))
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2)
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

function drawPattern(
  ctx: CanvasRenderingContext2D,
  rawData: Uint8Array,
  palette: string[],
  time: number,
  sensitivity: number
) {
  const points = 80

  ctx.beginPath()

  for (let i = 0; i < points; i++) {
    const progress = i / points
    const freqIndex = Math.floor(progress * (rawData.length / 2))
    const freqValue = (rawData[freqIndex] || 0) / 255

    const x = progress * 400
    const wave1 = Math.sin(progress * Math.PI * 2 + time) * 30
    const wave2 = Math.sin(progress * Math.PI * 4 - time * 2) * 20
    const audioBoost = freqValue * 100 * sensitivity
    const y = wave1 + wave2 + audioBoost

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  // Gradient stroke
  const gradient = ctx.createLinearGradient(0, -100, 400, 100)
  palette.forEach((color, index) => {
    gradient.addColorStop(index / (palette.length - 1), hexToRgba(color, 0.8))
  })

  ctx.strokeStyle = gradient
  ctx.lineWidth = 2
  ctx.stroke()

  // Add glow effect
  ctx.strokeStyle = gradient
  ctx.lineWidth = 4
  ctx.globalAlpha = 0.3
  ctx.stroke()
  ctx.globalAlpha = 1
}
