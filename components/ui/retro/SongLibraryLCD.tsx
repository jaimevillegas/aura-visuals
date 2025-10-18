'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils/cn'
import { Music, Play, Pause, Upload } from 'lucide-react'

interface Song {
  filename: string
  name: string
  path: string
}

interface SongLibraryLCDProps {
  songs: Song[]
  selectedSong: string | null
  currentSongName: string | null
  isPlaying: boolean
  currentTime: number
  duration: number
  onSelectSong: (song: Song) => void
  onPlayPause: () => void
  onLoadFile: () => void
  onSeek: (time: number) => void
  isLoading?: boolean
  className?: string
}

/**
 * SongLibraryLCD - Combined LCD display with song library
 *
 * Features:
 * - LCD header showing current playing song
 * - Scrollable song list with LCD green styling
 * - Retro CRT/LCD aesthetic
 * - Integrated design matching the retro theme
 */
export const SongLibraryLCD = memo(function SongLibraryLCD({
  songs,
  selectedSong,
  currentSongName,
  isPlaying,
  currentTime,
  duration,
  onSelectSong,
  onPlayPause,
  onLoadFile,
  onSeek,
  isLoading = false,
  className,
}: SongLibraryLCDProps) {
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  return (
    <div
      className={cn(
        'relative h-full flex flex-col',
        'border-2 rounded border-neon-green',
        'bg-black',
        className
      )}
      style={{
        boxShadow: `
          0 0 10px rgba(0, 255, 65, 0.3),
          inset 0 0 20px rgba(0, 255, 65, 0.1),
          inset 0 2px 8px rgba(0, 0, 0, 0.8)
        `
      }}
    >
      {/* Header - Current Song Display with Controls */}
      <div
        className="relative z-10 p-2 border-b-2 border-neon-green/30 bg-black flex items-center justify-between gap-2"
        style={{
          textShadow: '0 0 10px currentColor, 0 0 20px currentColor'
        }}
      >
        {/* Song Name */}
        <div className="flex-1 min-w-0">
          {currentSongName ? (
            <p className="text-sm font-mono-retro font-bold text-neon-green truncate">
              ▶ {currentSongName}
            </p>
          ) : (
            <p className="text-xs font-mono-retro text-neon-green/60 tracking-wider">
              SELECT OR LOAD AUDIO FILE
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            disabled={!currentSongName}
            className={cn(
              'px-2 py-1',
              'font-mono-retro text-xs',
              'border border-neon-green/50',
              'transition-all duration-150',
              'flex items-center gap-1',
              currentSongName
                ? 'text-neon-green hover:bg-neon-green/10 hover:border-neon-green'
                : 'text-neon-green/30 border-neon-green/20 cursor-not-allowed'
            )}
            style={
              currentSongName
                ? {
                  textShadow: '0 0 8px currentColor',
                  boxShadow: '0 0 5px rgba(0, 255, 65, 0.3)'
                }
                : undefined
            }
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Load Button */}
          <button
            onClick={onLoadFile}
            className={cn(
              'px-2 py-1',
              'font-mono-retro text-xs',
              'border border-neon-green/50',
              'text-neon-green',
              'hover:bg-neon-green/10 hover:border-neon-green',
              'transition-all duration-150',
              'flex items-center gap-1'
            )}
            style={{
              textShadow: '0 0 8px currentColor',
              boxShadow: '0 0 5px rgba(0, 255, 65, 0.3)'
            }}
          >
            <Upload size={12} />
            <span>LOAD</span>
          </button>
        </div>
      </div>

      {/* Progress Bar - Only show when song is loaded */}
      {currentSongName && (
        <div className="relative z-10 px-2 py-1.5 border-b-2 border-neon-green/30 bg-black">
          {/* Time display */}
          <div className="flex justify-between text-xs font-mono-retro text-neon-green/80 mb-1 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-black border border-neon-green/40 rounded-sm overflow-hidden">
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 bg-neon-green transition-all duration-100"
              style={{
                width: `${progressPercentage}%`,
                boxShadow: '0 0 8px rgba(0, 255, 65, 0.6)'
              }}
            />

            {/* Interactive overlay */}
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {/* Scanline effect */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 65, 0.1) 1px, rgba(0, 255, 65, 0.1) 2px)'
              }}
            />
          </div>
        </div>
      )}

      {/* Song List */}
      <div className="relative flex-1 min-h-0 overflow-y-auto scrollbar-green">
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-xs font-mono-retro text-neon-green/60 animate-pulse">
              LOADING SONGS...
            </p>
          </div>
        ) : songs.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-xs font-mono-retro text-neon-green/60">
              NO SONGS IN /ASSETS
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {songs.map((song) => {
              const isActive = selectedSong === song.path

              return (
                <button
                  key={song.path}
                  onClick={() => onSelectSong(song)}
                  className={cn(
                    'relative group w-full',
                    'px-2 py-1',
                    'font-mono-retro text-xs',
                    'transition-all duration-150',
                    'flex items-center gap-2',
                    'border border-transparent',
                    // Active state
                    isActive && 'bg-neon-green/10 border-neon-green/50',
                    isActive && 'text-neon-green font-bold',
                    // Inactive state
                    !isActive && 'text-neon-green/70',
                    !isActive && 'hover:bg-neon-green/5 hover:border-neon-green/30 hover:text-neon-green'
                  )}
                  style={
                    isActive
                      ? {
                        textShadow: '0 0 8px currentColor, 0 0 15px currentColor'
                      }
                      : undefined
                  }
                >
                  {/* Music Icon */}
                  <Music size={12} className="flex-shrink-0" />

                  {/* Song name */}
                  <span className="relative z-10 block truncate text-left flex-1">
                    {song.name}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <span className="flex-shrink-0 text-neon-green">●</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Subtle scanlines effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 z-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}
      />
    </div>
  )
})
