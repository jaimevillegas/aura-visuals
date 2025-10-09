import { create } from 'zustand';

type FrequencyData = {
  low: number;
  mid: number;
  high: number;
};

interface AudioState {
  frequencyData: FrequencyData;
  updateFrequencyData: (data: FrequencyData) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  frequencyData: { low: 0, mid: 0, high: 0 },
  updateFrequencyData: (data) => set({ frequencyData: data }),
}));

