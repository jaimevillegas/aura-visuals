// components/canvas/GlobalAudioProvider.tsx
'use client'

import { useEffect } from 'react'
import { AudioManager } from '@/lib/audio/AudioManager'
import { useAudioStore } from '@/stores/audioStore'

/**
 * Proveedor global de audio que funciona tanto para visualizadores 2D como 3D
 * Se ejecuta fuera del Canvas de Three.js
 */
export function GlobalAudioProvider() {
  const updateFrequencyData = useAudioStore((state) => state.updateFrequencyData)

  useEffect(() => {
    let animationFrameId: number

    const updateAudio = () => {
      const audioManager = AudioManager.getInstance()
      const data = audioManager.getFrequencyData()
      updateFrequencyData(data)

      animationFrameId = requestAnimationFrame(updateAudio)
    }

    updateAudio()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [updateFrequencyData])

  return null
}
