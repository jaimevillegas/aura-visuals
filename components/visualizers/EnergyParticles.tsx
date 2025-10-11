// components/visualizers/EnergyParticles.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

interface EnergyParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  life: number
  maxLife: number
  energy: number
}

export function EnergyParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<EnergyParticle[]>([])
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
    let emitters: { x: number; y: number; angle: number }[] = []

    // Create energy emitters around the screen
    const createEmitters = () => {
      const params = getVisualizerParams('energyparticles')
      const emitterCount = params.emitterCount || 6

      for (let i = 0; i < emitterCount; i++) {
        const angle = (i / emitterCount) * Math.PI * 2
        emitters.push({
          x: canvas.width / 2 + Math.cos(angle) * 200,
          y: canvas.height / 2 + Math.sin(angle) * 200,
          angle: angle
        })
      }
    }

    createEmitters()

    const createParticle = (x: number, y: number, angle: number, speed: number, hue: number): EnergyParticle => {
      const spreadAngle = angle + (Math.random() - 0.5) * Math.PI / 4
      return {
        x,
        y,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed,
        size: Math.random() * 3 + 1,
        hue,
        life: 0,
        maxLife: Math.random() * 100 + 50,
        energy: Math.random()
      }
    }

    const render = () => {
      // Get custom parameters for this visualizer
      const params = getVisualizerParams('energyparticles')
      const emitterCount = params.emitterCount || 6
      const sensitivity = params.sensitivity || 1.0
      const particleSize = params.particleSize || 1.0
      const gravityStrength = params.gravityStrength || 1.0

      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Dark fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Update emitter positions (orbit)
      emitters.forEach((emitter, i) => {
        const freqIndex = Math.floor((i / emitters.length) * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        emitter.angle += (0.01 + mid * 0.05) * (i % 2 === 0 ? 1 : -1)
        const distance = 200 + freqValue * 150 * sensitivity
        emitter.x = centerX + Math.cos(emitter.angle) * distance
        emitter.y = centerY + Math.sin(emitter.angle) * distance

        // Emit particles
        if (freqValue > 0.2) {
          const emitCount = Math.floor(freqValue * 3 * sensitivity)
          for (let j = 0; j < emitCount; j++) {
            const speed = 2 + freqValue * 8
            particlesRef.current.push(
              createParticle(emitter.x, emitter.y, emitter.angle + Math.PI, speed, i / emitters.length)
            )
          }
        }

        // Draw emitter glow
        const emitterSize = 15 + freqValue * 25
        const emitterGradient = ctx.createRadialGradient(
          emitter.x, emitter.y, 0,
          emitter.x, emitter.y, emitterSize
        )
        const colorIndex = i % palette.length
        emitterGradient.addColorStop(0, hexToRgba('#ffffff', 0.8))
        emitterGradient.addColorStop(0.3, hexToRgba(palette[colorIndex], 0.6))
        emitterGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = emitterGradient
        ctx.beginPath()
        ctx.arc(emitter.x, emitter.y, emitterSize, 0, Math.PI * 2)
        ctx.fill()
      })

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life++

        // Get frequency for this particle
        const freqIndex = Math.floor(particle.hue * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        // Gravity toward center
        const dx = centerX - particle.x
        const dy = centerY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const force = (low * 0.001 + 0.0001) * sensitivity * gravityStrength

        particle.vx += (dx / distance) * force * distance * 0.01
        particle.vy += (dy / distance) * force * distance * 0.01

        // Audio reactive forces
        const audioForce = freqValue * 0.1 * sensitivity
        particle.vx += (Math.random() - 0.5) * audioForce
        particle.vy += (Math.random() - 0.5) * audioForce

        // Damping
        particle.vx *= 0.98
        particle.vy *= 0.98

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Life-based alpha
        const lifeProgress = particle.life / particle.maxLife
        const lifeFactor = Math.sin(lifeProgress * Math.PI)
        const alpha = lifeFactor * (0.4 + freqValue * 0.6)

        // Size
        const size = particle.size * particleSize * (0.5 + freqValue * 1.5) * lifeFactor

        // Color
        const colorIndex = Math.floor(particle.hue * palette.length)
        const color = palette[colorIndex]

        // Draw particle with trail
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 4
        )
        gradient.addColorStop(0, hexToRgba(color, alpha))
        gradient.addColorStop(0.3, hexToRgba(color, alpha * 0.6))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size * 4, 0, Math.PI * 2)
        ctx.fill()

        // Bright core
        if (particle.energy > 0.7) {
          ctx.fillStyle = hexToRgba('#ffffff', alpha * 0.9)
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, size * 0.8, 0, Math.PI * 2)
          ctx.fill()
        }

        // Motion trail
        const trailLength = Math.sqrt(particle.vx ** 2 + particle.vy ** 2) * 5
        if (trailLength > 2) {
          ctx.beginPath()
          ctx.moveTo(particle.x - particle.vx * 3, particle.y - particle.vy * 3)
          ctx.lineTo(particle.x, particle.y)
          ctx.strokeStyle = hexToRgba(color, alpha * 0.5)
          ctx.lineWidth = size
          ctx.stroke()
        }

        // Keep particle alive
        return particle.life < particle.maxLife
      })

      // Limit particle count
      if (particlesRef.current.length > 2000) {
        particlesRef.current = particlesRef.current.slice(-2000)
      }

      // Central energy core
      const coreSize = 60 + high * 100 * sensitivity
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreSize
      )
      coreGradient.addColorStop(0, hexToRgba('#ffffff', 0.4))
      coreGradient.addColorStop(0.3, hexToRgba(palette[0], 0.3))
      coreGradient.addColorStop(0.6, hexToRgba(palette[1], 0.15))
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2)
      ctx.fill()

      // Energy rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = coreSize * (1.5 + i * 0.5)
        const ringAlpha = (1 - i / 3) * high * 0.3

        ctx.strokeStyle = hexToRgba(palette[i % palette.length], ringAlpha)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.stroke()
      }

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
