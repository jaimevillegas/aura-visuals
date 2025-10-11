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
  oscilloscope: {
    id: 'oscilloscope',
    name: 'Oscilloscope Wave',
    component: lazy(() =>
      import('@/components/visualizers/OscilloscopeWave').then(module => ({ default: module.OscilloscopeWave }))
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
  radialwaves: {
    id: 'radialwaves',
    name: 'Radial Waves',
    component: lazy(() =>
      import('@/components/visualizers/RadialWaves').then(module => ({ default: module.RadialWaves }))
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
  fractalrings: {
    id: 'fractalrings',
    name: 'Fractal Rings',
    component: lazy(() =>
      import('@/components/visualizers/FractalRings').then(module => ({ default: module.FractalRings }))
    ),
  },
  geometricmandala: {
    id: 'geometricmandala',
    name: 'Geometric Mandala',
    component: lazy(() =>
      import('@/components/visualizers/GeometricMandala').then(module => ({ default: module.GeometricMandala }))
    ),
  },
  tunnelvision: {
    id: 'tunnelvision',
    name: 'Tunnel Vision',
    component: lazy(() =>
      import('@/components/visualizers/TunnelVision').then(module => ({ default: module.TunnelVision }))
    ),
  },
  starfield: {
    id: 'starfield',
    name: 'Star Field',
    component: lazy(() =>
      import('@/components/visualizers/StarField').then(module => ({ default: module.StarField }))
    ),
  },
  waveformgrid: {
    id: 'waveformgrid',
    name: 'Waveform Grid',
    component: lazy(() =>
      import('@/components/visualizers/WaveformGrid').then(module => ({ default: module.WaveformGrid }))
    ),
  },
  nebulacloud: {
    id: 'nebulacloud',
    name: 'Nebula Cloud',
    component: lazy(() =>
      import('@/components/visualizers/NebulaCloud').then(module => ({ default: module.NebulaCloud }))
    ),
  },
  cosmicdust: {
    id: 'cosmicdust',
    name: 'Cosmic Dust',
    component: lazy(() =>
      import('@/components/visualizers/CosmicDust').then(module => ({ default: module.CosmicDust }))
    ),
  },
  energyparticles: {
    id: 'energyparticles',
    name: 'Energy Particles',
    component: lazy(() =>
      import('@/components/visualizers/EnergyParticles').then(module => ({ default: module.EnergyParticles }))
    ),
  },
  meteorshower: {
    id: 'meteorshower',
    name: 'Meteor Shower',
    component: lazy(() =>
      import('@/components/visualizers/MeteorShower').then(module => ({ default: module.MeteorShower }))
    ),
  },
  galaxyspiral: {
    id: 'galaxyspiral',
    name: 'Galaxy Spiral',
    component: lazy(() =>
      import('@/components/visualizers/GalaxySpiral').then(module => ({ default: module.GalaxySpiral }))
    ),
  },
  aurorawaves: {
    id: 'aurorawaves',
    name: 'Aurora Waves',
    component: lazy(() =>
      import('@/components/visualizers/AuroraWaves').then(module => ({ default: module.AuroraWaves }))
    ),
  },
}
