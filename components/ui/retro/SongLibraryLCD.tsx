'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils/cn'
import { Music } from 'lucide-react'

interface Song {
  filename: string
  name: string
  path: string
}

interface SongLibraryLCDProps {
  songs: Song[]
  selectedSong: string | null
  currentSongName: string | null
  onSelectSong: (song: Song) => void
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
  onSelectSong,
  isLoading = false,
  className,
}: SongLibraryLCDProps) {
  return (
    <div
      className={cn(
        'relative',
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
      {/* Header - Current Song Display */}
      <div
        className="relative z-10 p-3 border-b-2 border-neon-green/30 bg-black"
        style={{
          textShadow: '0 0 10px currentColor, 0 0 20px currentColor'
        }}
      >
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

      {/* Song List */}
      <div className="relative max-h-[120px] overflow-y-auto scrollbar-green">
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
