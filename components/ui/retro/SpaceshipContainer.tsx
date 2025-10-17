'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface SpaceshipContainerProps {
  children: ReactNode
  showScanlines?: boolean
  showGrid?: boolean
  className?: string
}

/**
 * SpaceshipContainer - Main container with spaceship/retro aesthetics
 *
 * Provides the base visual environment for the retro UI with:
 * - Dark gradient background (Tron-style)
 * - Optional scanline overlay (CRT effect)
 * - Optional grid pattern background
 * - Neon border glow
 */
export function SpaceshipContainer({
  children,
  showScanlines = false,
  showGrid = false,
  className,
}: SpaceshipContainerProps) {
  return (
    <div
      className={cn(
        // Base styles
        'relative min-h-screen w-full overflow-hidden',
        // Background gradient (dark retro space theme)
        'bg-gradient-to-br from-retro-dark via-retro-panel to-retro-dark',
        // Optional grid pattern
        showGrid && 'grid-pattern',
        // Optional scanlines
        showScanlines && 'scanlines',
        className
      )}
    >
      {/* Subtle radial glow from center */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[120px]" />
      </div>

      {/* Border glow effect */}
      <div className="absolute inset-0 pointer-events-none border-2 border-neon-cyan/20 shadow-[inset_0_0_30px_rgba(0,255,255,0.1)]" />

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Corner accents (Tron-style) */}
      <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-cyan/60 to-transparent" />
        <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-neon-cyan/60 to-transparent" />
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-0.5 bg-gradient-to-l from-neon-cyan/60 to-transparent" />
        <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-neon-cyan/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-neon-cyan/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-0.5 h-full bg-gradient-to-t from-neon-cyan/60 to-transparent" />
      </div>
      <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-neon-cyan/60 to-transparent" />
        <div className="absolute bottom-0 right-0 w-0.5 h-full bg-gradient-to-t from-neon-cyan/60 to-transparent" />
      </div>
    </div>
  )
}
