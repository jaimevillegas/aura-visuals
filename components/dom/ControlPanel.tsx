// components/dom/ControlPanel.tsx
'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useVisualizerStore, COLOR_PALETTES, VISUALIZER_CONFIGS } from '@/stores/visualizerStore';
import { useAudioStore } from '@/stores/audioStore';
import { AudioManager } from '@/lib/audio/AudioManager';
import { VISUALIZER_REGISTRY } from '@/constants/visualizerRegistry';
import { AnalogSlider } from '@/components/ui/retro/AnalogSlider';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { RetroPanel } from '@/components/ui/retro/RetroPanel';
import { VisualizerSelector } from '@/components/ui/retro/VisualizerSelector';
import { ColorPaletteSelector } from '@/components/ui/retro/ColorPaletteSelector';
import { SongLibraryLCD } from '@/components/ui/retro/SongLibraryLCD';
import { AboutModal } from '@/components/ui/retro/AboutModal';

interface Song {
  filename: string
  name: string
  path: string
}

export function ControlPanel() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [selectedSongPath, setSelectedSongPath] = useState<string | null>(null);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [wasPlayingBeforeModal, setWasPlayingBeforeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OPTIMIZED: Use specific selectors to prevent unnecessary re-renders
  const activePalette = useVisualizerStore((state) => state.activePalette);
  const activeVisualizer = useVisualizerStore((state) => state.activeVisualizer);
  const setActivePalette = useVisualizerStore((state) => state.setActivePalette);
  const setActiveVisualizer = useVisualizerStore((state) => state.setActiveVisualizer);
  const setVisualizerParam = useVisualizerStore((state) => state.setVisualizerParam);
  const getVisualizerParams = useVisualizerStore((state) => state.getVisualizerParams);

  const isPlaying = useAudioStore((state) => state.isPlaying);
  const currentSong = useAudioStore((state) => state.currentSong);
  const currentTime = useAudioStore((state) => state.currentTime);
  const duration = useAudioStore((state) => state.duration);
  const isPanelExpanded = useAudioStore((state) => state.isPanelExpanded);
  const setIsPlaying = useAudioStore((state) => state.setIsPlaying);
  const setCurrentSong = useAudioStore((state) => state.setCurrentSong);
  const setCurrentTime = useAudioStore((state) => state.setCurrentTime);
  const setDuration = useAudioStore((state) => state.setDuration);
  const setIsPanelExpanded = useAudioStore((state) => state.setIsPanelExpanded);

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

  const handleSeek = useCallback((time: number) => {
    audioManager.setCurrentTime(time);
    setCurrentTime(time);
  }, [audioManager, setCurrentTime]);

  const handleOpenAboutModal = useCallback(() => {
    // Save current playing state
    setWasPlayingBeforeModal(isPlaying);
    // Pause music if playing
    if (isPlaying) {
      audioManager.pause();
    }
    setIsAboutModalOpen(true);
  }, [isPlaying, audioManager]);

  const handleCloseAboutModal = useCallback(() => {
    setIsAboutModalOpen(false);
    // Resume music if it was playing before
    if (wasPlayingBeforeModal) {
      audioManager.play();
    }
  }, [wasPlayingBeforeModal, audioManager]);

  return (
    <div className="w-full h-full overflow-y-auto">
      <RetroPanel variant="primary" hasGlow hasBevel glowColor="cyan" className="rounded-none border-x-0 border-b-0 h-full">
        <div className="h-full max-w-7xl mx-auto flex flex-col">
          {/* Header with Collapse/Expand Button and About Button */}
          <div className="w-full border-b-2 border-neon-cyan bg-retro-panel flex items-center gap-0 py-1">
            {/* Collapse/Expand Button - Takes remaining space */}
            <button
              onClick={() => setIsPanelExpanded(!isPanelExpanded)}
              className="flex-1 py-1 px-4 hover:bg-neon-cyan/10 transition-all duration-200 flex items-center justify-center gap-2"
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

            {/* About Button - Fixed width on the right */}
            <button
              onClick={handleOpenAboutModal}
              className="flex-shrink-0 px-3 py-1 mx-2 border-2 border-neon-green/50 rounded text-neon-green hover:bg-neon-green/10 hover:border-neon-green transition-all duration-200 flex items-center gap-1"
              style={{
                textShadow: '0 0 8px currentColor',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)'
              }}
              title="About Aura Visuals"
            >
              <Info size={14} />
              <span className="text-xs font-ui font-bold uppercase">About</span>
            </button>
          </div>

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
              <div className="lg:col-span-4 flex flex-col" style={{ height: 'calc(40vh - 4rem)' }}>
                {/* Container with fixed height matching side columns */}
                <div className="flex-1 flex flex-col min-h-0 gap-2">
                  {/* Song Library LCD - Takes remaining space */}
                  <div className="flex-1 min-h-0">
                    <SongLibraryLCD
                      songs={songs}
                      selectedSong={selectedSongPath}
                      currentSongName={currentSong}
                      isPlaying={isPlaying}
                      currentTime={currentTime}
                      duration={duration}
                      onSelectSong={handleSongSelect}
                      onPlayPause={handlePlayPause}
                      onLoadFile={() => fileInputRef.current?.click()}
                      onSeek={handleSeek}
                      isLoading={isLoadingSongs}
                    />
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {/* Color Palette - Fixed height at bottom */}
                  <div className="flex-shrink-0">
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

      {/* About Modal */}
      <AboutModal isOpen={isAboutModalOpen} onClose={handleCloseAboutModal} />
    </div>
  );
}
