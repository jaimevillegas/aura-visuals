import { create } from 'zustand';

type FrequencyData = {
  low: number;
  mid: number;
  high: number;
  rawData: Uint8Array;
};

interface AudioState {
  frequencyData: FrequencyData;
  isPlaying: boolean;
  currentSong: string | null;
  currentTime: number;
  duration: number;
  isPanelExpanded: boolean;
  updateFrequencyData: (data: FrequencyData) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentSong: (song: string | null) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPanelExpanded: (expanded: boolean) => void;
}

const initialFrequencyData = new Uint8Array(1024);

export const useAudioStore = create<AudioState>((set) => ({
  frequencyData: { low: 0, mid: 0, high: 0, rawData: initialFrequencyData },
  isPlaying: false,
  currentSong: null,
  currentTime: 0,
  duration: 0,
  isPanelExpanded: true,
  updateFrequencyData: (data) => set({
    frequencyData: {
      low: data.low,
      mid: data.mid,
      high: data.high,
      // Aseguramos que rawData siempre sea un Uint8Array válido
      rawData: data.rawData || initialFrequencyData
    }
  }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentSong: (song) => set({ currentSong: song }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setIsPanelExpanded: (expanded) => {
    set({ isPanelExpanded: expanded });
    // Dispatch resize event to trigger canvas recalculation
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  },
}));

