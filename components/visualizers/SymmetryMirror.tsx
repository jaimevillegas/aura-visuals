// components/visualizers/SymmetryMirror.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'

export function SymmetryMirror() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { activePalette, getVisualizerParams } = useVisualizerStore()
  const palette = COLOR_PALETTES[activePalette]

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

    const render = () => {
      // Get parameters
      const params = getVisualizerParams('symmetrymirror')
      const mirrorAxes = params.mirrorAxes || 2  // 1=horizontal, 2=both, 4=quad
      const waveScale = params.waveScale || 150
      const sensitivity = params.sensitivity || 1.0
      const lineThickness = params.lineThickness || 2

      const { rawData } = useAudioStore.getState().frequencyData

      // Clear with fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Sample points from waveform
      const sampleCount = Math.min(200, rawData.length)
      const step = rawData.length / sampleCount

      // Set line properties globally
      ctx.lineWidth = lineThickness
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      // Draw waveform with mirroring
      const drawWaveform = (flipX: number, flipY: number) => {
        ctx.beginPath()

        for (let i = 0; i < sampleCount; i++) {
          const dataIndex = Math.floor(i * step)
          const value = (rawData[dataIndex] || 0) / 255

          // Horizontal position
          const x = ((i / sampleCount) - 0.5) * canvas.width * 0.8

          // Vertical position based on waveform
          const y = (value - 0.5) * waveScale * sensitivity

          // Apply mirroring
          const finalX = centerX + (x * flipX)
          const finalY = centerY + (y * flipY)

          if (i === 0) {
            ctx.moveTo(finalX, finalY)
          } else {
            ctx.lineTo(finalX, finalY)
          }
        }

        // Gradient stroke based on position
        const gradient = ctx.createLinearGradient(
          centerX - canvas.width * 0.4,
          centerY - waveScale,
          centerX + canvas.width * 0.4,
          centerY + waveScale
        )

        palette.forEach((color, index) => {
          gradient.addColorStop(index / (palette.length - 1), color)
        })

        ctx.strokeStyle = gradient
        ctx.globalAlpha = 0.8
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Draw based on number of mirror axes (1-6)
      const axesCount = Math.floor(mirrorAxes)

      for (let i = 0; i < axesCount; i++) {
        const angle = (Math.PI * 2 / axesCount) * i

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(angle)
        ctx.translate(-centerX, -centerY)

        // Draw original waveform
        drawWaveform(1, 1)
        // Draw mirrored waveform
        drawWaveform(1, -1)

        ctx.restore()
      }

      // Draw center point
      const centerSize = 4
      ctx.fillStyle = palette[0]
      ctx.beginPath()
      ctx.arc(centerX, centerY, centerSize, 0, Math.PI * 2)
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
