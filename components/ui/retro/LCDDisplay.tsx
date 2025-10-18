'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface LCDDisplayProps {
  children: ReactNode
  variant?: 'green' | 'amber' | 'cyan'
  className?: string
}

/**
 * LCDDisplay - Retro LCD/CRT display component
 *
 * Features:
 * - Dark background with colored phosphor text
 * - Text glow effect
 * - CRT border styling
 * - Multiple color variants (green, amber, cyan)
 */
export function LCDDisplay({
  children,
  variant = 'green',
  className,
}: LCDDisplayProps) {
  const variantStyles = {
    green: {
      bg: 'bg-black',
      text: 'text-neon-green',
      border: 'border-neon-green',
      glow: 'shadow-[0_0_10px_rgba(0,255,65,0.5)]'
    },
    amber: {
      bg: 'bg-black',
      text: 'text-led-yellow',
      border: 'border-led-yellow',
      glow: 'shadow-[0_0_10px_rgba(255,221,0,0.5)]'
    },
    cyan: {
      bg: 'bg-black',
      text: 'text-neon-cyan',
      border: 'border-neon-cyan',
      glow: 'shadow-[0_0_10px_rgba(0,255,255,0.5)]'
    },
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        'relative',
        'p-4',
        'border-2 rounded',
        'font-mono-retro text-sm',
        styles.bg,
        styles.border,
        styles.glow,
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
      {/* Content with explicit text color and glow */}
      <div
        className={cn('relative z-10', styles.text)}
        style={{
          textShadow: '0 0 10px currentColor, 0 0 20px currentColor'
        }}
      >
        {children}
      </div>

      {/* Subtle scanlines effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}
      />
    </div>
  )
}
