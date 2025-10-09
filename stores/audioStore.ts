import { create } from 'zustand';

type FrequencyData = {
  low: number;
  mid: number;
  high: number;
  rawData: Uint8Array;
};

interface AudioState {
  frequencyData: FrequencyData;
  updateFrequencyData: (data: FrequencyData) => void;
}

const initialFrequencyData = new Uint8Array(1024);

export const useAudioStore = create<AudioState>((set) => ({
  frequencyData: { low: 0, mid: 0, high: 0, rawData: initialFrequencyData },
  updateFrequencyData: (data) => set({
    frequencyData: {
      low: data.low,
      mid: data.mid,
      high: data.high,
      // Aseguramos que rawData siempre sea un Uint8Array válido
      rawData: data.rawData || initialFrequencyData
    }
  }),
}));

