// components/visualizers/WaveformGrid.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba, lerpColor } from '@/lib/utils/colorUtils'

export function WaveformGrid() {
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
    let time = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('waveformgrid')
      const gridSize = params.gridSize || 20
      const sensitivity = params.sensitivity || 1.0
      const waveHeight = params.waveHeight || 1.0
      const perspective = params.perspective || 1.0

      const { rawData, low, mid } = useAudioStore.getState().frequencyData

      // Clear with fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      time += 0.02

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Perspective parameters
      const horizon = canvas.height * (0.3 * perspective)
      const vanishingPointY = horizon
      const maxDepth = 20

      // Draw horizontal grid lines (perspective)
      for (let z = 0; z < maxDepth; z++) {
        const depth = z / maxDepth
        const y = vanishingPointY + (canvas.height - vanishingPointY) * depth

        // Get frequency for this row
        const freqIndex = Math.floor(depth * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        const points: { x: number; y: number }[] = []

        // Calculate waveform points
        for (let x = 0; x <= gridSize; x++) {
          const progress = x / gridSize
          const xPos = progress * canvas.width

          // Wave offset based on frequency
          const waveFreqIndex = Math.floor(progress * (rawData.length / 2))
          const waveFreqValue = (rawData[waveFreqIndex] || 0) / 255

          // Multiple wave layers
          const wave1 = Math.sin(progress * Math.PI * 4 + time - depth * 2) * 20
          const wave2 = Math.cos(progress * Math.PI * 6 - time * 1.5) * 15
          const audioWave = waveFreqValue * 100 * sensitivity * waveHeight

          const waveOffset = (wave1 + wave2 + audioWave) * (1 - depth * 0.5)

          points.push({ x: xPos, y: y + waveOffset })
        }

        // Draw the line
        ctx.beginPath()
        points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })

        // Color gradient based on depth
        const colorProgress = depth
        const colorIndex = Math.floor(colorProgress * (palette.length - 1))
        const nextColorIndex = Math.min(colorIndex + 1, palette.length - 1)
        const lerpFactor = (colorProgress * (palette.length - 1)) - colorIndex
        const color = lerpColor(palette[colorIndex], palette[nextColorIndex], lerpFactor)

        const alpha = (1 - depth * 0.7) * (0.5 + freqValue * 0.5)
        ctx.strokeStyle = hexToRgba(color, alpha)
        ctx.lineWidth = 2 + freqValue * 3 * (1 - depth * 0.5)
        ctx.stroke()

        // Add glow
        ctx.strokeStyle = hexToRgba(color, alpha * 0.5)
        ctx.lineWidth = 4 + freqValue * 5 * (1 - depth * 0.5)
        ctx.globalAlpha = 0.3
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // Draw vertical grid lines
      for (let x = 0; x <= gridSize; x++) {
        const progress = x / gridSize
        const xPos = progress * canvas.width

        ctx.beginPath()

        for (let z = 0; z < maxDepth; z++) {
          const depth = z / maxDepth
          const y = vanishingPointY + (canvas.height - vanishingPointY) * depth

          // Get frequency
          const freqIndex = Math.floor(progress * (rawData.length / 2))
          const freqValue = (rawData[freqIndex] || 0) / 255

          // Wave offset
          const wave = Math.sin(depth * Math.PI * 4 + time) * 20
          const audioWave = freqValue * 50 * sensitivity * waveHeight
          const waveOffset = (wave + audioWave) * (1 - depth * 0.5)

          if (z === 0) {
            ctx.moveTo(xPos, y + waveOffset)
          } else {
            ctx.lineTo(xPos, y + waveOffset)
          }
        }

        // Color for vertical lines
        const colorIndex = x % palette.length
        const alpha = 0.2
        ctx.strokeStyle = hexToRgba(palette[colorIndex], alpha)
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Horizon glow
      const horizonGradient = ctx.createLinearGradient(0, horizon - 50, 0, horizon + 50)
      horizonGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
      horizonGradient.addColorStop(0.5, hexToRgba(palette[0], 0.3 * mid))
      horizonGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = horizonGradient
      ctx.fillRect(0, horizon - 50, canvas.width, 100)

      // Draw floating particles above the grid
      for (let i = 0; i < 20; i++) {
        const particleX = (i / 20) * canvas.width
        const particleProgress = (i / 20 + time * 0.1) % 1
        const particleY = horizon * (1 - particleProgress)

        const freqIndex = Math.floor((i / 20) * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        if (freqValue > 0.3) {
          const size = 3 + freqValue * 8
          const particleGradient = ctx.createRadialGradient(particleX, particleY, 0, particleX, particleY, size)
          particleGradient.addColorStop(0, hexToRgba(palette[i % palette.length], particleProgress))
          particleGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

          ctx.fillStyle = particleGradient
          ctx.beginPath()
          ctx.arc(particleX, particleY, size, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Bottom glow
      const bottomGlow = 80 + low * 100 * sensitivity
      const bottomGradient = ctx.createRadialGradient(centerX, canvas.height, 0, centerX, canvas.height, bottomGlow)
      bottomGradient.addColorStop(0, hexToRgba(palette[palette.length - 1], 0.4))
      bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = bottomGradient
      ctx.fillRect(0, canvas.height - bottomGlow, canvas.width, bottomGlow)

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
