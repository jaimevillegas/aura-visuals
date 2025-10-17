// components/dom/ControlPanel.tsx
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useVisualizerStore, COLOR_PALETTES, VISUALIZER_CONFIGS } from '@/stores/visualizerStore';
import { useAudioStore } from '@/stores/audioStore';
import { AudioManager } from '@/lib/audio/AudioManager';
import { VISUALIZER_REGISTRY } from '@/constants/visualizerRegistry';
import { AnalogSlider } from '@/components/ui/retro/AnalogSlider';
import { ChevronDown, ChevronUp, Play, Pause, Square, Upload } from 'lucide-react';
import { RetroPanel } from '@/components/ui/retro/RetroPanel';
import { VisualizerSelector } from '@/components/ui/retro/VisualizerSelector';
import { ColorPaletteSelector } from '@/components/ui/retro/ColorPaletteSelector';
import { NeonButton } from '@/components/ui/retro/NeonButton';
import { SongLibraryLCD } from '@/components/ui/retro/SongLibraryLCD';

interface Song {
  filename: string
  name: string
  path: string
}

export function ControlPanel() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [selectedSongPath, setSelectedSongPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    activePalette,
    activeVisualizer,
    setActivePalette,
    setActiveVisualizer,
    setVisualizerParam,
    getVisualizerParams,
  } = useVisualizerStore();

  const {
    isPlaying,
    currentSong,
    currentTime,
    duration,
    isPanelExpanded,
    setIsPlaying,
    setCurrentSong,
    setCurrentTime,
    setDuration,
    setIsPanelExpanded
  } = useAudioStore();

  const audioManager = useMemo(() => AudioManager.getInstance(), []);

  // Memoize static arrays to prevent recalculation
  const paletteNames = useMemo(() =>
    Object.keys(COLOR_PALETTES) as (keyof typeof COLOR_PALETTES)[],
    []
  );

  const visualizerOptions = useMemo(() => {
    const ids = Object.keys(VISUALIZER_REGISTRY);
    return ids.map((id) => ({
      id,
      name: VISUALIZER_REGISTRY[id as keyof typeof VISUALIZER_REGISTRY].name,
    }));
  }, []);

  // Get current visualizer parameters
  const currentParams = getVisualizerParams(activeVisualizer);
  const visualizerConfig = useMemo(
    () => VISUALIZER_CONFIGS[activeVisualizer] || [],
    [activeVisualizer]
  );

  // Memoize grouped parameters
  const groupedParams = useMemo(() => {
    return visualizerConfig.reduce((acc, param) => {
      const category = param.category || 'visual';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(param);
      return acc;
    }, {} as Record<string, typeof visualizerConfig>);
  }, [visualizerConfig]);

  const categoryLabels = useMemo(() => ({
    audio: 'AUDIO REACTIVITY',
    visual: 'VISUAL PARAMETERS',
    motion: 'MOTION & ANIMATION',
    color: 'COLOR SETTINGS',
  }), []);

  // Fetch songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/songs');
        const data = await response.json();
        setSongs(data.songs || []);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setIsLoadingSongs(false);
      }
    };
    fetchSongs();
  }, []);

  // Audio control functions
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

  const handleSongSelect = useCallback(async (song: Song) => {
    try {
      const response = await fetch(song.path);
      const blob = await response.blob();
      const file = new File([blob], song.filename, { type: 'audio/mpeg' });
      await audioManager.loadAudioFile(file);
      setCurrentSong(song.name);
      setSelectedSongPath(song.path);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading song:', error);
    }
  }, [audioManager, setCurrentSong, setIsPlaying]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      await audioManager.loadAudioFile(file);
      setCurrentSong(file.name);
      setSelectedSongPath(null);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading audio file:', error);
    }
  }, [audioManager, setCurrentSong, setIsPlaying]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      audioManager.pause();
    } else {
      audioManager.play();
    }
  }, [isPlaying, audioManager]);

  const handleStop = useCallback(() => {
    audioManager.stop();
    setCurrentTime(0);
  }, [audioManager, setCurrentTime]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audioManager.setCurrentTime(time);
    setCurrentTime(time);
  }, [audioManager, setCurrentTime]);

  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoize progress bar background calculation
  const progressBackground = useMemo(() => {
    if (!duration || !currentTime) return '';
    const percentage = (currentTime / duration) * 100;
    return `linear-gradient(to right, #00ffff 0%, #00ffff ${percentage}%, #2a2a3e ${percentage}%, #2a2a3e 100%)`;
  }, [currentTime, duration]);

  return (
    <div className="w-full h-full overflow-y-auto">
      <RetroPanel variant="primary" hasGlow hasBevel glowColor="cyan" className="rounded-none border-x-0 border-b-0 h-full">
        <div className="h-full max-w-7xl mx-auto flex flex-col">
          {/* Collapse/Expand Button - Top Center */}
          <button
            onClick={() => setIsPanelExpanded(!isPanelExpanded)}
            className="w-full py-1 px-4 bg-retro-panel border-b-2 border-neon-cyan hover:bg-neon-cyan/10 transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
            }}
            title={isPanelExpanded ? 'Collapse Panel' : 'Expand Panel'}
          >
            <span className="text-xs font-ui font-bold text-neon-cyan uppercase tracking-wide">
              {isPanelExpanded ? 'Collapse Controls' : 'Expand Controls'}
            </span>
            {isPanelExpanded ? (
              <ChevronDown className="text-neon-cyan" size={16} />
            ) : (
              <ChevronUp className="text-neon-cyan" size={16} />
            )}
          </button>

          {isPanelExpanded && (
            <div className="flex-1 pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Visualizer Selector (4 cols) */}
              <div className="lg:col-span-4 flex flex-col" style={{ height: 'calc(40vh - 4rem)' }}>
                <div className="flex-1 overflow-hidden min-h-0">
                  <VisualizerSelector
                    options={visualizerOptions}
                    value={activeVisualizer}
                    onChange={setActiveVisualizer}
                  />
                </div>
              </div>

              {/* Center Column: Audio Controls (4 cols) */}
              <div className="lg:col-span-4 space-y-2">
                {/* Song Library LCD - Combined Display */}
                <SongLibraryLCD
                  songs={songs}
                  selectedSong={selectedSongPath}
                  currentSongName={currentSong}
                  onSelectSong={handleSongSelect}
                  isLoading={isLoadingSongs}
                />

                {/* Audio Controls */}
                <div className="space-y-2">

                  {/* Playback Controls - More compact */}
                  <div className="flex items-center justify-center gap-2">
                    <NeonButton
                      onClick={handlePlayPause}
                      disabled={!currentSong}
                      variant="cyan"
                      size="sm"
                      icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </NeonButton>

                    <NeonButton
                      onClick={handleStop}
                      disabled={!currentSong}
                      variant="orange"
                      size="sm"
                      icon={<Square size={16} />}
                      title="Stop"
                    >
                      Stop
                    </NeonButton>

                    <NeonButton
                      onClick={() => fileInputRef.current?.click()}
                      variant="green"
                      size="sm"
                      icon={<Upload size={16} />}
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

                  {/* Progress Bar - More compact */}
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
                          background: progressBackground
                        }}
                      />
                      <div className="flex justify-between text-xs font-mono-retro text-neon-cyan/70 tabular-nums">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Palette - Below audio controls */}
                <div>
                  <label className="text-xs font-ui font-bold text-neon-cyan uppercase tracking-wide mb-2 block">
                    Color Palette
                  </label>
                  <ColorPaletteSelector
                    palettes={paletteNames}
                    value={activePalette}
                    onChange={(value) => setActivePalette(value as keyof typeof COLOR_PALETTES)}
                  />
                </div>
              </div>

              {/* Right Column: Parameters (4 cols) */}
              <div className="lg:col-span-4 flex flex-col" style={{ height: 'calc(40vh - 4rem)' }}>
                <label className="text-xs font-ui font-bold text-neon-cyan uppercase tracking-wide mb-2 block flex-shrink-0">
                  Parameters
                </label>
                {visualizerConfig.length === 0 ? (
                  <div className="flex items-center justify-center flex-1 min-h-0">
                    <p className="text-xs font-mono-retro text-neon-cyan/50 italic">
                      No custom parameters
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin">
                    {/* Dynamic Parameters by Category */}
                    {Object.entries(groupedParams).map(([category, params]) => (
                      <div key={category} className="space-y-2">
                        <p className="text-xs font-ui font-bold text-neon-cyan uppercase tracking-wide border-b border-neon-cyan/20 pb-1">
                          {categoryLabels[category as keyof typeof categoryLabels] || category.toUpperCase()}
                        </p>

                        {params.map((param) => {
                          const value = currentParams[param.name] ?? param.defaultValue;

                          return (
                            <AnalogSlider
                              key={param.name}
                              label={param.label}
                              value={value}
                              onChange={(newValue) =>
                                setVisualizerParam(activeVisualizer, param.name, newValue)
                              }
                              min={param.min}
                              max={param.max}
                              step={param.step}
                              showLEDs={true}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </div>
          )}
        </div>
      </RetroPanel>
    </div>
  );
}
