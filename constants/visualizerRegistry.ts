// constants/visualizerRegistry.ts
import { lazy } from 'react'

// Usaremos lazy loading como se especifica en el plan para optimizar la carga inicial.
// La aplicación no cargará el código de un visualizador hasta que sea necesario.
export const VISUALIZER_REGISTRY = {
  kaleidoscope: {
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    component: lazy(() =>
      import('@/components/visualizers/KaleidoscopeViz').then(module => ({ default: module.KaleidoscopeViz }))
    ),
  },
  bars2d: {
    id: 'bars2d',
    name: 'Frequency Bars 2D',
    component: lazy(() =>
      import('@/components/visualizers/FrequencyBars2D').then(module => ({ default: module.FrequencyBars2D }))
    ),
  },
  particlecircle: {
    id: 'particlecircle',
    name: 'Particle Circle 2D',
    component: lazy(() =>
      import('@/components/visualizers/ParticleCircle').then(module => ({ default: module.ParticleCircle }))
    ),
  },
  spiralwaves: {
    id: 'spiralwaves',
    name: 'Spiral Waves',
    component: lazy(() =>
      import('@/components/visualizers/SpiralWaves').then(module => ({ default: module.SpiralWaves }))
    ),
  },
  circularwaveform: {
    id: 'circularwaveform',
    name: 'Circular Waveform',
    component: lazy(() =>
      import('@/components/visualizers/CircularWaveform').then(module => ({ default: module.CircularWaveform }))
    ),
  },
  symmetrymirror: {
    id: 'symmetrymirror',
    name: 'Symmetry Mirror',
    component: lazy(() =>
      import('@/components/visualizers/SymmetryMirror').then(module => ({ default: module.SymmetryMirror }))
    ),
  },
  geometricmandala: {
    id: 'geometricmandala',
    name: 'Geometric Mandala',
    component: lazy(() =>
      import('@/components/visualizers/GeometricMandala').then(module => ({ default: module.GeometricMandala }))
    ),
  },
  starfield: {
    id: 'starfield',
    name: 'Star Field',
    component: lazy(() =>
      import('@/components/visualizers/StarField').then(module => ({ default: module.StarField }))
    ),
  },
  nebulacloud: {
    id: 'nebulacloud',
    name: 'Nebula Cloud',
    component: lazy(() =>
      import('@/components/visualizers/NebulaCloud').then(module => ({ default: module.NebulaCloud }))
    ),
  },
  energyparticles: {
    id: 'energyparticles',
    name: 'Energy Particles',
    component: lazy(() =>
      import('@/components/visualizers/EnergyParticles').then(module => ({ default: module.EnergyParticles }))
    ),
  },
}
