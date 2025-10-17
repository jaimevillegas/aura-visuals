// components/dom/AudioControlPanel.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { AudioManager } from '@/lib/audio/AudioManager';
import { Play, Pause, Square, Upload } from 'lucide-react';
import { RetroPanel } from '@/components/ui/retro/RetroPanel';
import { LCDDisplay } from '@/components/ui/retro/LCDDisplay';
import { NeonButton } from '@/components/ui/retro/NeonButton';

export function AudioControlPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    isPlaying,
    currentSong,
    currentTime,
    duration,
    setIsPlaying,
    setCurrentSong,
    setCurrentTime,
    setDuration
  } = useAudioStore();

  const audioManager = AudioManager.getInstance();

  // Actualizar el tiempo actual cada segundo
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const time = audioManager.getCurrentTime();
      const dur = audioManager.getDuration();
      setCurrentTime(time);
      if (dur && !isNaN(dur)) {
        setDuration(dur);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, audioManager, setCurrentTime, setDuration]);

  // Escuchar eventos del audio element
  useEffect(() => {
    const audioElement = audioManager.getAudioElement();
    if (!audioElement) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentSong, audioManager, setIsPlaying, setCurrentTime, setDuration]);

  const handleFileSelect = async (file: File) => {
    try {
      await audioManager.loadAudioFile(file);
      setCurrentSong(file.name);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      handleFileSelect(file);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioManager.pause();
    } else {
      audioManager.play();
    }
  };

  const handleStop = () => {
    audioManager.stop();
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audioManager.setCurrentTime(time);
    setCurrentTime(time);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed bottom-[calc(60vh+1rem)] left-1/2 -translate-x-1/2 z-10 min-w-[400px]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <RetroPanel
        variant="primary"
        hasGlow
        hasBevel
        glowColor={isDragging ? 'pink' : 'cyan'}
        className="p-4"
      >
        <div className="space-y-3">
          {/* Song Name LCD Display */}
          <LCDDisplay variant="green" className="text-center min-h-[3rem] flex items-center justify-center">
            {currentSong ? (
              <p className="text-base font-bold truncate px-2">{currentSong}</p>
            ) : (
              <p className="text-sm opacity-70 tracking-wider">NO AUDIO LOADED</p>
            )}
          </LCDDisplay>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-2">
            <NeonButton
              onClick={handlePlayPause}
              disabled={!currentSong}
              variant="cyan"
              size="md"
              icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </NeonButton>

            <NeonButton
              onClick={handleStop}
              disabled={!currentSong}
              variant="orange"
              size="md"
              icon={<Square size={20} />}
              title="Stop"
            >
              Stop
            </NeonButton>

            <NeonButton
              onClick={() => fileInputRef.current?.click()}
              variant="green"
              size="md"
              icon={<Upload size={20} />}
              title="Load File"
            >
              Load
            </NeonButton>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Progress Bar */}
          {currentSong && (
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #00ffff 0%, #00ffff ${(currentTime / duration) * 100}%, #2a2a3e ${(currentTime / duration) * 100}%, #2a2a3e 100%)`
                }}
              />
              <div className="flex justify-between text-xs font-mono-retro text-neon-cyan/70 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Drag & Drop Zone */}
          {!currentSong && (
            <div className="text-center py-4 border-2 border-dashed border-neon-cyan/30 rounded-lg bg-retro-dark/50">
              <p className="text-xs font-mono-retro text-neon-cyan/60 uppercase tracking-wide">
                Drag audio file here or click load button
              </p>
            </div>
          )}
        </div>
      </RetroPanel>
    </div>
  );
}
