'use client';

import { useFrame } from '@react-three/fiber';
import { AudioManager } from '@/lib/audio/AudioManager';
import { useAudioStore } from '@/stores/audioStore';

export function AudioDataProvider() {
  const updateFrequencyData = useAudioStore((state) => state.updateFrequencyData);

  useFrame(() => {
    const audioManager = AudioManager.getInstance();
    const data = audioManager.getFrequencyData();
    updateFrequencyData(data);
  });

  return null;
}
