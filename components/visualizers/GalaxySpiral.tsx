// components/visualizers/GalaxySpiral.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

interface Star {
  angle: number
  distance: number
  size: number
  hue: number
  speed: number
}

export function GalaxySpiral() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
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

    if (starsRef.current.length === 0) {
      const params = getVisualizerParams('galaxyspiral')
      const starCount = params.starCount || 2000

      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          angle: Math.random() * Math.PI * 2,
          distance: Math.random() * 400,
          size: Math.random() * 2 + 0.5,
          hue: Math.random(),
          speed: Math.random() * 0.5 + 0.5
        })
      }
    }

    let animationFrameId: number
    let globalRotation = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('galaxyspiral')
      const starCount = params.starCount || 2000
      const spiralArms = params.spiralArms || 4
      const sensitivity = params.sensitivity || 1.0
      const rotationSpeed = params.rotationSpeed || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      globalRotation += (0.002 + mid * 0.01) * rotationSpeed

      starsRef.current.forEach((star) => {
        const freqIndex = Math.floor(star.hue * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        star.angle += (0.001 + freqValue * 0.005) * star.speed * rotationSpeed
        const spiralFactor = star.distance * 0.01
        const finalAngle = star.angle + spiralFactor + globalRotation

        const x = centerX + Math.cos(finalAngle) * star.distance
        const y = centerY + Math.sin(finalAngle) * star.distance

        const size = star.size * (0.5 + freqValue * 1.5)
        const colorIndex = Math.floor(star.hue * palette.length)
        const alpha = (0.4 + freqValue * 0.6) * (1 - star.distance / 400)

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4)
        gradient.addColorStop(0, hexToRgba(palette[colorIndex], alpha))
        gradient.addColorStop(0.5, hexToRgba(palette[colorIndex], alpha * 0.5))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size * 4, 0, Math.PI * 2)
        ctx.fill()
      })

      const coreSize = 60 + low * 100 * sensitivity
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreSize)
      coreGradient.addColorStop(0, hexToRgba('#ffffff', 0.8))
      coreGradient.addColorStop(0.5, hexToRgba(palette[0], 0.5))
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
      ctx.fill()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [activePalette, palette, getVisualizerParams])

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000' }} />
}
