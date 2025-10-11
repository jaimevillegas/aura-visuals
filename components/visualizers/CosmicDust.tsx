// components/visualizers/CosmicDust.tsx
'use client'

import { useRef, useEffect } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { hexToRgba } from '@/lib/utils/colorUtils'

interface DustParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  hue: number
  layer: number // depth layer for parallax
  rotationAngle: number
  rotationSpeed: number
}

export function CosmicDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<DustParticle[]>([])
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
    const params = getVisualizerParams('cosmicdust')
    const particleCount = params.particleCount || 1500
    const sensitivity = params.sensitivity || 1.0
    const particleSize = params.particleSize || 1.0
    const bloomIntensity = params.bloomIntensity || 1.0
    const rotationSpeed = params.rotationSpeed || 1.0

    // Initialize dust particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height))
      }
    }

    const createParticle = (width: number, height: number): DustParticle => {
      const layer = Math.random()
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 1.5 + 0.3,
        hue: Math.random(),
        layer: layer,
        rotationAngle: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      }
    }

    initParticles()

    let animationFrameId: number
    let globalRotation = 0

    const render = () => {
      const { rawData, low, mid, high } = useAudioStore.getState().frequencyData

      // Clear with slight fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (!rawData || rawData.length === 0) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      globalRotation += 0.001 * rotationSpeed

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Sort particles by layer for depth effect
      const sortedParticles = [...particlesRef.current].sort((a, b) => a.layer - b.layer)

      sortedParticles.forEach((particle) => {
        // Get frequency for this particle
        const freqIndex = Math.floor(particle.hue * (rawData.length / 2))
        const freqValue = (rawData[freqIndex] || 0) / 255

        // Parallax effect based on layer
        const parallaxFactor = 0.3 + particle.layer * 0.7
        const speedMultiplier = parallaxFactor * (1 + mid * sensitivity)

        // Orbital motion around center
        const dx = particle.x - centerX
        const dy = particle.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx)

        // Rotate around center
        const orbitalSpeed = globalRotation * parallaxFactor
        particle.rotationAngle += particle.rotationSpeed + orbitalSpeed

        const orbitalForce = 0.002 * (1 + low * 0.5)
        particle.vx += Math.cos(angle + Math.PI / 2) * orbitalForce * distance * 0.001
        particle.vy += Math.sin(angle + Math.PI / 2) * orbitalForce * distance * 0.001

        // Audio-reactive push/pull
        const audioForce = (freqValue - 0.5) * 0.1 * sensitivity
        const normalizedDx = dx / distance
        const normalizedDy = dy / distance
        particle.vx += normalizedDx * audioForce
        particle.vy += normalizedDy * audioForce

        // Update velocity with damping
        particle.vx *= 0.995
        particle.vy *= 0.995

        // Update position
        particle.x += particle.vx * speedMultiplier
        particle.y += particle.vy * speedMultiplier

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Size based on layer, audio, and particle size param
        const baseSize = particle.size * particleSize
        const layerSize = baseSize * (0.5 + particle.layer * 0.5)
        const audioSize = layerSize * (1 + freqValue * 2 * sensitivity)

        // Color from palette with depth-based brightness
        const colorIndex = Math.floor(particle.hue * palette.length)
        const color = palette[colorIndex]
        const alpha = (0.2 + freqValue * 0.5) * bloomIntensity * particle.layer

        // Draw particle
        const glowSize = audioSize * (3 + high * 5)
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowSize
        )
        gradient.addColorStop(0, hexToRgba(color, alpha))
        gradient.addColorStop(0.4, hexToRgba(color, alpha * 0.4))
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // Small bright core for foreground particles
        if (particle.layer > 0.7 && freqValue > 0.2) {
          ctx.fillStyle = hexToRgba('#ffffff', alpha * 0.8)
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, audioSize * 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Density clouds in background
      const cloudCount = 5
      for (let i = 0; i < cloudCount; i++) {
        const angle = (i / cloudCount) * Math.PI * 2 + globalRotation * 0.5
        const distance = 200 + Math.sin(globalRotation * 3 + i) * 100
        const cloudX = centerX + Math.cos(angle) * distance
        const cloudY = centerY + Math.sin(angle) * distance
        const cloudSize = 150 + mid * 200 * sensitivity

        const cloudGradient = ctx.createRadialGradient(
          cloudX, cloudY, 0,
          cloudX, cloudY, cloudSize
        )
        const colorIndex = i % palette.length
        cloudGradient.addColorStop(0, hexToRgba(palette[colorIndex], 0.1))
        cloudGradient.addColorStop(0.5, hexToRgba(palette[colorIndex], 0.05))
        cloudGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.fillStyle = cloudGradient
        ctx.beginPath()
        ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // Vortex effect in center
      const vortexSize = 50 + low * 80 * sensitivity
      const vortexGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, vortexSize
      )
      vortexGradient.addColorStop(0, hexToRgba('#ffffff', 0.3))
      vortexGradient.addColorStop(0.3, hexToRgba(palette[0], 0.2))
      vortexGradient.addColorStop(0.6, hexToRgba(palette[1], 0.1))
      vortexGradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

      ctx.fillStyle = vortexGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, vortexSize, 0, Math.PI * 2)
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
