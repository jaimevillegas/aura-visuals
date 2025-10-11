'use client'

import dynamicImport from 'next/dynamic'
import { Suspense } from 'react'
import { ControlPanel } from '@/components/dom/ControlPanel';

// Desactivar generación estática para esta página
export const dynamic = 'force-dynamic'

// Importación dinámica de componentes que usan Web Audio API
const GlobalAudioProvider = dynamicImport(() => import('../../components/canvas/GlobalAudioProvider').then(mod => ({ default: mod.GlobalAudioProvider })), {
  ssr: false,
})

const AudioControls = dynamicImport(() => import('../../components/dom/AudioControls').then(mod => ({ default: mod.AudioControls })), {
  ssr: false,
})

const AudioControlPanel = dynamicImport(() => import('@/components/dom/AudioControlPanel').then(mod => ({ default: mod.AudioControlPanel })), {
  ssr: false,
})

const VisualizerScene = dynamicImport(() => import('../../components/canvas/VisualizerScene'), {
  ssr: false, // Canvas API necesita el objeto 'window', que no existe en el servidor
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
      Cargando visualizador...
    </div>
  )
}

export default function VisualizerPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#111' }}>
      {/* Proveedor global de audio que funciona para todos los visualizadores */}
      <GlobalAudioProvider />

      <AudioControls />
      <ControlPanel />
      <AudioControlPanel />
      <Suspense fallback={<Loader />}>
        <VisualizerScene />
      </Suspense>
    </div>
  )
}
