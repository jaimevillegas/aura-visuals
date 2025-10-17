'use client'

import dynamicImport from 'next/dynamic'
import { Suspense } from 'react'
import { SpaceshipContainer } from '@/components/ui/retro/SpaceshipContainer'

// Desactivar generación estática para esta página
export const dynamic = 'force-dynamic'

// Importación dinámica de componentes que usan Web Audio API
const GlobalAudioProvider = dynamicImport(() => import('../../components/canvas/GlobalAudioProvider').then(mod => ({ default: mod.GlobalAudioProvider })), {
  ssr: false,
})

const ControlPanel = dynamicImport(() => import('@/components/dom/ControlPanel').then(mod => ({ default: mod.ControlPanel })), {
  ssr: false,
})

const VisualizerScene = dynamicImport(() => import('../../components/canvas/VisualizerScene'), {
  ssr: false, // Canvas API necesita el objeto 'window', que no existe en el servidor
})

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="text-neon-cyan text-glow-cyan font-display text-xl uppercase tracking-widest animate-pulse">
          Initializing System...
        </div>
        <div className="mt-4 h-1 w-64 bg-retro-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-pink animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  )
}

export default function VisualizerPage() {
  return (
    <>
      {/* Background container with retro aesthetics */}

      {/* Proveedor global de audio */}
      <GlobalAudioProvider />

      {/* Main layout container with Flexbox - separates visualizer and panel */}
      <div className="h-screen w-full flex flex-col overflow-hidden">
        {/* Visualizer Canvas - Takes remaining space, isolated from panel */}
        <div className="flex-1 min-h-0 relative">
          <Suspense fallback={<Loader />}>
            <VisualizerScene />
          </Suspense>
        </div>

        {/* Control Panel - Fixed height, separate container below visualizer */}
        <div className="h-auto max-h-[40vh] flex-shrink-0">
          <ControlPanel />
        </div>
      </div>
    </>
  )
}
