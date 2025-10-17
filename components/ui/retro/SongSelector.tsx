'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils/cn'
import { Music } from 'lucide-react'

interface Song {
  filename: string
  name: string
  path: string
}

interface SongSelectorProps {
  songs: Song[]
  selectedSong: string | null
  onSelectSong: (song: Song) => void
  isLoading?: boolean
  className?: string
}

/**
 * SongSelector - Retro selector for songs from assets folder
 *
 * Features:
 * - Grid layout with retro buttons
 * - LED indicator for active state
 * - Music icon for each song
 * - Neon glow on active/hover
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const SongSelector = memo(function SongSelector({
  songs,
  selectedSong,
  onSelectSong,
  isLoading = false,
  className,
}: SongSelectorProps) {
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <p className="text-xs font-mono-retro text-neon-cyan/60 animate-pulse">
          Loading songs...
        </p>
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <p className="text-xs font-mono-retro text-neon-cyan/60">
          No songs found in /assets
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Grid of song buttons */}
      <div className="grid grid-cols-1 gap-2">
        {songs.map((song) => {
          const isActive = selectedSong === song.path

          return (
            <button
              key={song.path}
              onClick={() => onSelectSong(song)}
              className={cn(
                'relative group',
                'px-3 py-1.5',
                'border-2',
                'font-ui text-xs uppercase tracking-wide',
                'transition-all duration-200',
                'overflow-hidden',
                'flex items-center gap-2',
                // Active state
                isActive && 'border-neon-cyan bg-neon-cyan/10',
                isActive && 'shadow-[0_0_15px_rgba(0,255,255,0.5)]',
                // Inactive state
                !isActive && 'border-retro-border bg-retro-panel/50',
                !isActive && 'hover:border-neon-cyan/50 hover:bg-neon-cyan/5',
                // Text color
                isActive ? 'text-neon-cyan' : 'text-neon-cyan/60',
                // Bevel effect
                'shadow-[inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(0,0,0,0.5)]'
              )}
            >
              {/* LED Indicator */}
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full">
                <div
                  className={cn(
                    'w-full h-full rounded-full',
                    isActive && 'bg-neon-green',
                    isActive && 'shadow-[0_0_4px_rgba(0,255,65,0.8)]',
                    !isActive && 'bg-retro-border'
                  )}
                />
              </div>

              {/* Music Icon */}
              <Music size={14} className="flex-shrink-0" />

              {/* Song name */}
              <span className="relative z-10 block truncate text-left flex-1">
                {song.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
})
