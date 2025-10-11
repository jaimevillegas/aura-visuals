// components/canvas/VisualizerScene.tsx
'use client'

import { Suspense } from 'react'
import { useVisualizerStore } from '@/stores/visualizerStore'
import { VISUALIZER_REGISTRY } from '@/constants/visualizerRegistry'

export default function VisualizerScene() {
  // Leemos del store cuál es el visualizador activo
  const activeVisualizerId = useVisualizerStore((state) => state.activeVisualizer)

  // Obtenemos el componente correspondiente del registro
  const ActiveVisualizer = VISUALIZER_REGISTRY[activeVisualizerId as keyof typeof VISUALIZER_REGISTRY]?.component

  // Todos los visualizadores son ahora 2D y se renderizan directamente
  return (
    <Suspense fallback={<div style={{ color: 'white' }}>Loading...</div>}>
      {ActiveVisualizer ? <ActiveVisualizer /> : null}
    </Suspense>
  )
}
