// components/canvas/VisualizerScene.tsx
'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { AudioDataProvider } from './AudioDataProvider'
import { useVisualizerStore } from '@/stores/visualizerStore'
import { VISUALIZER_REGISTRY } from '@/constants/visualizerRegistry'

// Un componente de carga para el Suspense
function VisualizerLoader() {
  return <mesh></mesh> // Puedes poner un loader 3D aquí si quieres
}

export default function VisualizerScene() {
  // Leemos del store cuál es el visualizador activo
  const activeVisualizerId = useVisualizerStore((state) => state.activeVisualizer)
  const { barCount } = useVisualizerStore();

  // Obtenemos el componente correspondiente del registro
  const ActiveVisualizer = VISUALIZER_REGISTRY[activeVisualizerId as keyof typeof VISUALIZER_REGISTRY]?.component

  return (
    <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
      {/* Luces */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Helpers */}
      <OrbitControls />

      {/* Proveedor de datos de audio */}
      <AudioDataProvider />

      {/* Lógica de renderizado dinámico */}
      <Suspense fallback={<VisualizerLoader />}>
        {ActiveVisualizer ? <ActiveVisualizer key={barCount} /> : null}
      </Suspense>
    </Canvas>
  )
}
