// components/visualizers/AuroraWaves.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

interface AuroraParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  layer: number
}

export function AuroraWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<AuroraParticle[]>([])
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

    // Get custom parameters for this visualizer
    const params = getVisualizerParams('aurorawaves')
    const particleCount = params.particleCount || 600
    const sensitivity = params.sensitivity || 1.0
    const particleSize = params.particleSize || 1.0
    const bloomIntensity = params.bloomIntensity || 1.0
    const waveAmplitude = params.waveAmplitude || 1.0

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.7,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 3 + 1,
          hue: Math.random(),
          layer: Math.random()
        })
      }
    }

    let animationFrameId: number
    let time = 0

    const render = () => {
      const { rawData, low, mid } = useAudioStore.getState().frequencyData
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      time += 0.02

      particlesRef.current.forEach((particle) => {
        const freqIndex = Math.floor(particle.hue * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        const wave = Math.sin(particle.x * 0.01 + time + particle.layer * 2) * 20 * waveAmplitude
        particle.vy = wave * 0.05 * sensitivity
        particle.vx += (Math.random() - 0.5) * 0.1 * freqValue

        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height * 0.7
        if (particle.y > canvas.height * 0.7) particle.y = 0

        const size = particle.size * particleSize * (1 + freqValue) * particle.layer
        const colorIndex = Math.floor(particle.hue * palette.length)
        const alpha = (0.2 + freqValue * 0.6) * bloomIntensity * particle.layer

        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, size * 10)
        gradient.addColorStop(0, hexToRgba(palette[colorIndex], alpha))
        gradient.addColorStop(0.4, hexToRgba(palette[colorIndex], alpha * 0.5))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size * 10, 0, Math.PI * 2)
        ctx.fill()
      })

      for (let i = 0; i < 3; i++) {
        const waveY = canvas.height * 0.3 + i * 80
        ctx.beginPath()
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = waveY + Math.sin(x * 0.01 + time * 2 - i) * 30 * waveAmplitude * (1 + mid * sensitivity)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = hexToRgba(palette[i % palette.length], 0.3 * bloomIntensity)
        ctx.lineWidth = 3
        ctx.stroke()
      }

      const bottomGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height)
      bottomGradient.addColorStop(0, hexToRgba(palette[0], low * 0.3))
      bottomGradient.addColorStop(1, hexToRgba(palette[1], low * 0.1))
      ctx.fillStyle = bottomGradient
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3)

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
