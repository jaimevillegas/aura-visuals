'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ControlSectionProps {
  children: ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
  title?: string
  className?: string
}

/**
 * ControlSection - Collapsible section for control panels
 *
 * Features:
 * - Retractable panel (spaceship-style)
 * - Slide up/down animation
 * - Optional title bar
 * - Neon accent on expand/collapse button
 */
export function ControlSection({
  children,
  collapsible = true,
  defaultExpanded = true,
  title = 'CONTROLS',
  className,
}: ControlSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'transition-transform duration-300 ease-out',
        className
      )}
    >
      {/* Collapse/Expand Button */}
      {collapsible && (
        <div className="flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'px-6 py-2 -mb-px',
              'border-2 border-b-0 border-neon-cyan/50',
              'bg-retro-panel/90 backdrop-blur-sm',
              'rounded-t-lg',
              'font-display text-xs uppercase tracking-widest',
              'text-neon-cyan',
              'hover:border-glow-cyan',
              'transition-all duration-200',
              'flex items-center gap-2'
            )}
          >
            <span>{title}</span>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Control Panel Content */}
      <div
        className={cn(
          'bg-retro-dark/95 backdrop-blur-md',
          'border-t-2 border-neon-cyan/30',
          'shadow-[0_-10px_40px_rgba(0,255,255,0.2)]',
          'transition-all duration-300 ease-out',
          isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        )}
      >
        {/* Top glow line */}
        <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
