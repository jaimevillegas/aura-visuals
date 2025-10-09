// stores/visualizerStore.ts
import { create } from 'zustand';
import * as THREE from 'three';

// 1. Definimos nuestras paletas de colores
export const COLOR_PALETTES = {
  neon: [new THREE.Color('#00ffff'), new THREE.Color('#ff00ff'), new THREE.Color('#ffff00')],
  synthwave: [new THREE.Color('#ff00c1'), new THREE.Color('#9a00ff'), new THREE.Color('#00b8ff')],
  cosmic: [new THREE.Color('#ffffff'), new THREE.Color('#a0a0ff'), new THREE.Color('#ffa0a0')],
};

// 2. Definimos los tipos para nuestros parámetros
type VisualizerParameters = {
  barCount: number;
  sensitivity: number;
  activePalette: keyof typeof COLOR_PALETTES;
  activeVisualizer: string;
};

// 3. Definimos el estado y las acciones para modificarlo
interface VisualizerState extends VisualizerParameters {
  setBarCount: (count: number) => void;
  setSensitivity: (value: number) => void;
  setActivePalette: (palette: keyof typeof COLOR_PALETTES) => void;
  setActiveVisualizer: (visualizerId: string) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  // Valores iniciales
  barCount: 64,
  sensitivity: 1.0,
  activePalette: 'neon',
  activeVisualizer: 'spectrum',

  // Funciones para actualizar el estado
  setBarCount: (count) => set({ barCount: count }),
  setSensitivity: (value) => set({ sensitivity: value }),
  setActivePalette: (palette) => set({ activePalette: palette }),
  setActiveVisualizer: (visualizerId) => set({ activeVisualizer: visualizerId }),
}));
