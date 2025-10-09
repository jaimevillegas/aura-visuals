// constants/visualizerRegistry.ts
import { lazy } from 'react'

// Usaremos lazy loading como se especifica en el plan para optimizar la carga inicial.
// La aplicación no cargará el código de un visualizador hasta que sea necesario.
export const VISUALIZER_REGISTRY = {
  spectrum: {
    id: 'spectrum',
    name: 'Spectrum Bars',
    component: lazy(() =>
      import('@/components/visualizers/SpectrumBars').then(module => ({ default: module.SpectrumBars }))
    ),
    // Más adelante añadiremos parámetros por defecto, etc.
  },
  // Aquí es donde añadiremos el túnel y las partículas en la Fase 3
}
