'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'cyan' | 'pink' | 'green' | 'orange'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  className?: string
}

/**
 * NeonButton - Retro button with mechanical press effect and neon glow
 *
 * Features:
 * - Bevel effect for 3D depth
 * - Neon glow on hover
 * - Press animation on click
 * - Support for icons
 */
export function NeonButton({
  children,
  variant = 'cyan',
  size = 'md',
  icon,
  className,
  ...props
}: NeonButtonProps) {
  // TODO: Implement in Phase 3
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'border-2 bevel',
        'font-ui font-medium uppercase tracking-wide',
        'transition-all duration-150',
        'active:scale-95 active:translate-y-0.5',
        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        // Variants (basic for now)
        variant === 'cyan' && 'border-neon-cyan/50 text-neon-cyan hover:border-glow-cyan',
        variant === 'pink' && 'border-neon-pink/50 text-neon-pink hover:border-glow-pink',
        variant === 'orange' && 'border-neon-orange/50 text-neon-orange hover:border-glow-orange',
        variant === 'green' && 'border-neon-green/50 text-neon-green',
        'bg-retro-panel/50 hover:bg-retro-panel/80',
        className
      )}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
