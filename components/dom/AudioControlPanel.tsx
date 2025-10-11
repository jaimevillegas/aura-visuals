// components/dom/AudioControlPanel.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { useAudioStore } from '@/stores/audioStore';
import { AudioManager } from '@/lib/audio/AudioManager';
import { Play, Pause, Square, Upload } from 'lucide-react';

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
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '16px',
        borderRadius: '12px',
        minWidth: '400px',
        color: 'white',
        backdropFilter: 'blur(10px)',
        border: isDragging ? '2px solid #00ffff' : '1px solid rgba(255, 255, 255, 0.1)',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="space-y-3">
        {/* Nombre de la canción */}
        <div className="text-center">
          {currentSong ? (
            <p className="text-sm font-bold text-cyan-400 truncate">{currentSong}</p>
          ) : (
            <p className="text-xs text-gray-400">No hay música cargada</p>
          )}
        </div>

        {/* Controles de reproducción */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handlePlayPause}
            disabled={!currentSong}
            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={handleStop}
            disabled={!currentSong}
            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Detener"
          >
            <Square size={24} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Cargar archivo"
          >
            <Upload size={24} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>

        {/* Barra de progreso */}
        {currentSong && (
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #00ffff 0%, #00ffff ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Zona de arrastrar y soltar */}
        {!currentSong && (
          <div className="text-center py-4 border-2 border-dashed border-gray-600 rounded-lg">
            <p className="text-xs text-gray-400">
              Arrastra un archivo de audio aquí o haz clic en el botón de cargar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
