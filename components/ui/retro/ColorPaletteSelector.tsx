'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils/cn'

interface ColorPaletteSelectorProps {
  palettes: string[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * ColorPaletteSelector - Horizontal color palette selector with LED indicators
 *
 * Features:
 * - Compact horizontal button layout (2 rows)
 * - LED indicator for active state
 * - Neon glow on active/hover
 * - Similar style to VisualizerSelector
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const ColorPaletteSelector = memo(function ColorPaletteSelector({
  palettes,
  value,
  onChange,
  className,
}: ColorPaletteSelectorProps) {
  return (
    <div className={cn('grid grid-cols-4 gap-2', className)}>
      {palettes.map((palette) => {
        const isActive = value === palette
        const displayName = palette.charAt(0).toUpperCase() + palette.slice(1)

        return (
          <button
            key={palette}
            onClick={() => onChange(palette)}
            className={cn(
              'relative group',
              'px-3 py-1.5',
              'border-2',
              'font-ui text-xs uppercase tracking-wide',
              'transition-all duration-200',
              'overflow-hidden',
              'flex-shrink-0',
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
            {/* LED Indicator - removed animate-pulse for performance */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full">
              <div
                className={cn(
                  'w-full h-full rounded-full',
                  isActive && 'bg-neon-green',
                  isActive && 'shadow-[0_0_4px_rgba(0,255,65,0.8)]',
                  !isActive && 'bg-retro-border'
                )}
              />
            </div>

            {/* Button text */}
            <span className="relative z-10 block">
              {displayName}
            </span>

            {/* Removed gradient overlays and scanline effects for performance */}
          </button>
        )
      })}
    </div>
  )
})
