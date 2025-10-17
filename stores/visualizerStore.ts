// stores/visualizerStore.ts
import { create } from 'zustand';

// 1. Definimos nuestras paletas de colores (ahora solo strings)
export const COLOR_PALETTES = {
  neon: ['#00ffff', '#ff00ff', '#ffff00'],
  synthwave: ['#ff00c1', '#9a00ff', '#00b8ff'],
  cosmic: ['#ffffff', '#a0a0ff', '#ffa0a0'],
  fire: ['#ff0000', '#ff8800', '#ffff00'],
  ocean: ['#001f3f', '#0074d9', '#7fdbff'],
  forest: ['#2ecc40', '#3d9970', '#01ff70'],
  sunset: ['#ff4136', '#ff851b', '#ffdc00'],
  purple: ['#b10dc9', '#f012be', '#d946ef'],
};

// 2. Definición de tipos de parámetros
export interface VisualizerParameter {
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  category?: 'audio' | 'visual' | 'color' | 'motion';
}

// 3. Configuraciones de parámetros por visualizador
export const VISUALIZER_CONFIGS: Record<string, VisualizerParameter[]> = {
  kaleidoscope: [
    { name: 'segments', label: 'Segments', min: 4, max: 12, step: 1, defaultValue: 6, category: 'visual' },
    { name: 'rayCount', label: 'Ray Count', min: 20, max: 80, step: 10, defaultValue: 40, category: 'visual' },
    { name: 'rayLength', label: 'Ray Length', min: 0.3, max: 1.0, step: 0.05, defaultValue: 0.7, category: 'visual' },
    { name: 'rotationSpeed', label: 'Rotation Speed', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'motion' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
  ],
  bars2d: [
    { name: 'barCount', label: 'Bar Count', min: 32, max: 256, step: 16, defaultValue: 64, category: 'visual' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'barSpacing', label: 'Bar Spacing', min: 0, max: 1, step: 0.05, defaultValue: 0.2, category: 'visual' },
    { name: 'smoothing', label: 'Smoothing', min: 0, max: 1, step: 0.05, defaultValue: 0.5, category: 'visual' },
  ],
  particlecircle: [
    { name: 'particleCount', label: 'Particle Count', min: 50, max: 300, step: 10, defaultValue: 150, category: 'visual' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'particleSize', label: 'Particle Size', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'visual' },
    { name: 'rotationSpeed', label: 'Rotation Speed', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'motion' },
  ],
  spiralwaves: [
    { name: 'spiralCount', label: 'Spiral Arms', min: 2, max: 12, step: 1, defaultValue: 6, category: 'visual' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'rotationSpeed', label: 'Rotation Speed', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'motion' },
    { name: 'waveAmplitude', label: 'Wave Amplitude', min: 0.3, max: 2.0, step: 0.1, defaultValue: 1.0, category: 'visual' },
  ],
  circularwaveform: [
    { name: 'radius', label: 'Circle Radius', min: 50, max: 300, step: 10, defaultValue: 150, category: 'visual' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'lineThickness', label: 'Line Thickness', min: 1, max: 10, step: 0.5, defaultValue: 2, category: 'visual' },
    { name: 'rotationSpeed', label: 'Rotation Speed', min: 0, max: 2, step: 0.1, defaultValue: 0.5, category: 'motion' },
  ],
  symmetrymirror: [
    { name: 'mirrorSegments', label: 'Mirror Segments', min: 2, max: 8, step: 1, defaultValue: 4, category: 'visual' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'particleSize', label: 'Particle Size', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'visual' },
    { name: 'bloomIntensity', label: 'Bloom Intensity', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'visual' },
  ],
  geometricmandala: [
    { name: 'petalCount', label: 'Petal Count', min: 6, max: 24, step: 1, defaultValue: 12, category: 'visual' },
    { name: 'layers', label: 'Layer Count', min: 2, max: 8, step: 1, defaultValue: 4, category: 'visual' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'rotationSpeed', label: 'Rotation Speed', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'motion' },
  ],
  starfield: [
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'particleSize', label: 'Star Size', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'visual' },
    { name: 'rotationSpeed', label: 'Rotation Speed', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'motion' },
    { name: 'bloomIntensity', label: 'Bloom Intensity', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'visual' },
  ],
  nebulacloud: [
    { name: 'particleCount', label: 'Particle Count', min: 400, max: 1200, step: 100, defaultValue: 800, category: 'visual' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'particleSize', label: 'Particle Size', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'visual' },
    { name: 'bloomIntensity', label: 'Bloom Intensity', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'visual' },
    { name: 'swirlSpeed', label: 'Swirl Speed', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'motion' },
  ],
  energyparticles: [
    { name: 'emitterCount', label: 'Emitter Count', min: 3, max: 12, step: 1, defaultValue: 6, category: 'visual' },
    { name: 'sensitivity', label: 'Audio Sensitivity', min: 0.1, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'audio' },
    { name: 'particleSize', label: 'Particle Size', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.0, category: 'visual' },
    { name: 'gravityStrength', label: 'Gravity Strength', min: 0, max: 2, step: 0.1, defaultValue: 1.0, category: 'motion' },
  ],
};

// 4. Type para los parámetros dinámicos
export type VisualizerParams = Record<string, number>;

// 5. Estado del store
interface VisualizerState {
  // Básicos
  activePalette: keyof typeof COLOR_PALETTES;
  activeVisualizer: string;

  // Parámetros dinámicos por visualizador
  visualizerParams: Record<string, VisualizerParams>;

  // Acciones
  setActivePalette: (palette: keyof typeof COLOR_PALETTES) => void;
  setActiveVisualizer: (visualizerId: string) => void;
  setVisualizerParam: (visualizerId: string, paramName: string, value: number) => void;
  getVisualizerParams: (visualizerId: string) => VisualizerParams;
}

// 6. Helper para obtener valores por defecto de un visualizador
const getDefaultParams = (visualizerId: string): VisualizerParams => {
  const config = VISUALIZER_CONFIGS[visualizerId];
  if (!config) return {};

  const defaults: VisualizerParams = {};
  config.forEach(param => {
    defaults[param.name] = param.defaultValue;
  });
  return defaults;
};

export const useVisualizerStore = create<VisualizerState>((set, get) => ({
  // Valores iniciales
  activePalette: 'neon',
  activeVisualizer: 'kaleidoscope',
  visualizerParams: {
    kaleidoscope: getDefaultParams('kaleidoscope'),
  },

  // Funciones para actualizar el estado
  setActivePalette: (palette) => set({ activePalette: palette }),

  setActiveVisualizer: (visualizerId) => {
    set({ activeVisualizer: visualizerId });

    // Inicializar parámetros si no existen
    const current = get().visualizerParams;
    if (!current[visualizerId]) {
      set({
        visualizerParams: {
          ...current,
          [visualizerId]: getDefaultParams(visualizerId),
        },
      });
    }
  },

  setVisualizerParam: (visualizerId, paramName, value) => {
    const current = get().visualizerParams;
    set({
      visualizerParams: {
        ...current,
        [visualizerId]: {
          ...(current[visualizerId] || {}),
          [paramName]: value,
        },
      },
    });
  },

  getVisualizerParams: (visualizerId) => {
    const params = get().visualizerParams[visualizerId];
    return params || getDefaultParams(visualizerId);
  },
}));
