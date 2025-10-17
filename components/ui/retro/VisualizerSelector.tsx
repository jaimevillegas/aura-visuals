'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils/cn'

interface VisualizerOption {
  id: string
  name: string
}

interface VisualizerSelectorProps {
  options: VisualizerOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * VisualizerSelector - Custom retro selector for visualizers
 *
 * Features:
 * - Grid layout with retro buttons
 * - LED indicator for active state
 * - Neon glow on active/hover
 * - Switch panel aesthetic
 *
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const VisualizerSelector = memo(function VisualizerSelector({
  options,
  value,
  onChange,
  className,
}: VisualizerSelectorProps) {
  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Grid of visualizer buttons with scroll - 2 columns */}
      <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto pr-2 scrollbar-thin">
        {options.map((option) => {
          const isActive = value === option.id

          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={cn(
                'relative group',
                'px-2 py-1',
                'h-auto',
                'border-2',
                'font-ui text-[11px] uppercase tracking-wide leading-tight',
                'transition-all duration-200',
                'overflow-hidden',
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
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full">
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
              <span className="relative z-10 block truncate">
                {option.name}
              </span>

              {/* Removed gradient overlays and scanline effects for performance */}
            </button>
          )
        })}
      </div>
    </div>
  )
})
