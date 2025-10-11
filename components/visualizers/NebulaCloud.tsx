// components/visualizers/NebulaCloud.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  alpha: number
  life: number
}

export function NebulaCloud() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
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

    // Initialize particles
    const initParticles = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('nebulacloud')
      const particleCount = params.particleCount || 800

      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height))
      }
    }

    const createParticle = (width: number, height: number): Particle => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        hue: Math.random(),
        alpha: Math.random() * 0.5 + 0.3,
        life: Math.random()
      }
    }

    initParticles()

    let animationFrameId: number
    let time = 0

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('nebulacloud')
      const particleCount = params.particleCount || 800
      const sensitivity = params.sensitivity || 1.0
      const particleSize = params.particleSize || 1.0
      const bloomIntensity = params.bloomIntensity || 1.0
      const swirlSpeed = params.swirlSpeed || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Fade effect for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      time += 0.01

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Get frequency for this particle
        const freqIndex = Math.floor(particle.hue * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        // Update velocity based on audio (nebula turbulence)
        const turbulence = freqValue * sensitivity * 2
        particle.vx += (Math.random() - 0.5) * turbulence * 0.1
        particle.vy += (Math.random() - 0.5) * turbulence * 0.1

        // Add swirling motion
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const dx = particle.x - centerX
        const dy = particle.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)

        const swirl = (mid * 0.0003 + 0.0001) * sensitivity * swirlSpeed
        particle.vx += Math.cos(angle + Math.PI / 2) * swirl * distance * 0.01
        particle.vy += Math.sin(angle + Math.PI / 2) * swirl * distance * 0.01

        // Damping
        particle.vx *= 0.98
        particle.vy *= 0.98

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < -50) particle.x = canvas.width + 50
        if (particle.x > canvas.width + 50) particle.x = -50
        if (particle.y < -50) particle.y = canvas.height + 50
        if (particle.y > canvas.height + 50) particle.y = -50

        // Update life and alpha
        particle.life = (particle.life + 0.002) % 1
        const lifeFactor = Math.sin(particle.life * Math.PI)
        particle.alpha = (0.3 + freqValue * 0.5) * lifeFactor * bloomIntensity

        // Size based on frequency and life
        const size = (particle.size + freqValue * 5) * particleSize * (0.5 + lifeFactor * 0.5)

        // Color from palette
        const colorIndex = Math.floor(particle.hue * palette.length)
        const color = palette[colorIndex]

        // Draw particle with large soft glow (nebula effect)
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 8
        )
        gradient.addColorStop(0, hexToRgba(color, particle.alpha))
        gradient.addColorStop(0.2, hexToRgba(color, particle.alpha * 0.6))
        gradient.addColorStop(0.5, hexToRgba(color, particle.alpha * 0.3))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size * 8, 0, Math.PI * 2)
        ctx.fill()

        // Bright core
        if (freqValue > 0.3) {
          const coreGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, size * 2
          )
          coreGradient.addColorStop(0, hexToRgba('#ffffff', particle.alpha * 0.8))
          coreGradient.addColorStop(0.5, hexToRgba(color, particle.alpha * 0.5))
          coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

          ctx.fillStyle = coreGradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Add new particles when high frequencies spike
      if (high > 0.6 && particlesRef.current.length < particleCount * 1.5) {
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push(createParticle(canvas.width, canvas.height))
        }
      }

      // Remove excess particles
      if (particlesRef.current.length > particleCount) {
        particlesRef.current = particlesRef.current.slice(0, particleCount)
      }

      // Draw connections between nearby particles
      if (low > 0.4) {
        const connectionDistance = 150
        for (let i = 0; i < particlesRef.current.length; i++) {
          const p1 = particlesRef.current[i]

          for (let j = i + 1; j < Math.min(i + 10, particlesRef.current.length); j++) {
            const p2 = particlesRef.current[j]
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < connectionDistance) {
              const alpha = (1 - dist / connectionDistance) * low * 0.15
              const colorIndex = Math.floor(((p1.hue + p2.hue) / 2) * palette.length)

              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = hexToRgba(palette[colorIndex], alpha)
              ctx.lineWidth = 1
              ctx.stroke()
            }
          }
        }
      }

      // Central energy burst effect
      const burstRadius = 80 + mid * 150 * sensitivity
      const burstGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, burstRadius
      )
      burstGradient.addColorStop(0, hexToRgba(palette[0], mid * 0.3))
      burstGradient.addColorStop(0.5, hexToRgba(palette[1], mid * 0.15))
      burstGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = burstGradient
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, burstRadius, 0, Math.PI * 2)
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
        width: '100vw',
        height: '100vh',
        background: '#000',
      }}
    />
  )
}
