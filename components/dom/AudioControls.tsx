'use client';

import { AudioManager } from '@/lib/audio/AudioManager';
import { RetroPanel } from '@/components/ui/retro/RetroPanel';
import { Upload } from 'lucide-react';

export function AudioControls() {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const audioManager = AudioManager.getInstance();
        await audioManager.loadAudioFile(file);
        console.log(`Audio file "${file.name}" loaded and playing.`);
      } catch (error) {
        console.error("Error loading audio file:", error);
        alert("Error processing audio file.");
      }
    }
  };

  return (
    <div className="absolute top-5 left-5 z-10">
      <RetroPanel variant="primary" hasGlow hasBevel glowColor="cyan" className="p-3">
        <label
          htmlFor="audio-upload"
          className="flex items-center gap-2 cursor-pointer text-neon-cyan hover:text-neon-pink transition-colors font-ui uppercase tracking-wide text-sm"
        >
          <Upload size={18} />
          <span>Load Audio</span>
          <input
            id="audio-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </RetroPanel>
    </div>
  );
}
