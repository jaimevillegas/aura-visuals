'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { AudioControls } from '../../components/dom/AudioControls';
import { ControlPanel } from '@/components/dom/ControlPanel';

// Importación dinámica del componente de la escena 3D
const VisualizerScene = dynamic(() => import('../../components/canvas/VisualizerScene'), {
  ssr: false, // ¡Muy importante! Three.js necesita el objeto 'window', que no existe en el servidor
})

function Loader() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      color: 'white',
      backgroundColor: 'black'
    }}>
      Cargando escena 3D...
    </div>
  )
}

export default function VisualizerPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      <AudioControls />
      <ControlPanel />
      <Suspense fallback={<Loader />}>
        <VisualizerScene />
      </Suspense>
    </div>
  )
}
