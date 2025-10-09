import { create } from 'zustand';

interface VisualizerState {
  activeVisualizer: string;
  setActiveVisualizer: (id: string) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  activeVisualizer: 'spectrum',
  setActiveVisualizer: (id) => set({ activeVisualizer: id }),
}));
