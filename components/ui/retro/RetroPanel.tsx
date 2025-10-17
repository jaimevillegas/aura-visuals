'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface RetroPanelProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  hasGlow?: boolean
  hasBevel?: boolean
  glowColor?: 'cyan' | 'pink' | 'orange'
  className?: string
}

/**
 * RetroPanel - Reusable panel component with retro console aesthetics
 *
 * Features:
 * - Beveled edges (3D effect)
 * - Semi-transparent background with backdrop blur
 * - Optional neon glow on borders
 * - Two variants for visual hierarchy
 */
export function RetroPanel({
  children,
  variant = 'primary',
  hasGlow = true,
  hasBevel = true,
  glowColor = 'cyan',
  className,
}: RetroPanelProps) {
  const glowStyles = {
    cyan: 'border-glow-cyan-optimized',
    pink: 'border-glow-pink-optimized',
    orange: 'border-glow-orange-optimized',
  }

  return (
    <div
      className={cn(
        // Base styles - REMOVED backdrop-blur-sm for performance
        'relative overflow-hidden',
        'border-2',
        // Padding
        'p-4',
        // Background based on variant - increased opacity for better readability without blur
        variant === 'primary' && 'bg-retro-panel/95',
        variant === 'secondary' && 'bg-retro-accent/85',
        // Border color (default subtle)
        !hasGlow && 'border-retro-border',
        // Optional glow effect - using optimized version
        hasGlow && glowStyles[glowColor],
        // Optional bevel (3D depth effect) - using optimized version
        hasBevel && 'bevel-optimized',
        className
      )}
    >
      {/* Inner content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Removed gradient overlays for performance */}
    </div>
  )
}
