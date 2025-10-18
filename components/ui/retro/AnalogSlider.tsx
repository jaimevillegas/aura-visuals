'use client'

import { useMemo, memo, useCallback, useRef, useState, useEffect } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { cn } from '@/lib/utils/cn'
import { throttle } from '@/lib/utils/throttle'

interface AnalogSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  showLEDs?: boolean
  className?: string
}

/**
 * AnalogSlider - Slider styled as analog potentiometer control
 *
 * Wraps Radix UI Slider with retro styling:
 * - Metallic track appearance
 * - Circular thumb with position indicator
 * - LED level indicators (VU meter style)
 * - Monospace label
 *
 * Optimized with React.memo and useMemo to prevent unnecessary re-renders
 */
export const AnalogSlider = memo(function AnalogSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showLEDs = true,
  className,
}: AnalogSliderProps) {
  // Local state for immediate UI updates
  const [localValue, setLocalValue] = useState(value)

  // Sync local value when prop value changes externally
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Throttled onChange for performance (33ms = ~30 updates/sec)
  const throttledOnChangeRef = useRef<((val: number) => void) | null>(null)

  if (!throttledOnChangeRef.current) {
    throttledOnChangeRef.current = throttle(onChange, 33)
  }

  const handleValueChange = useCallback((newValues: number[]) => {
    const newValue = newValues[0]
    setLocalValue(newValue) // Update UI immediately
    throttledOnChangeRef.current?.(newValue) // Throttled store update
  }, [])

  // Memoize calculations - use localValue for immediate UI feedback
  const { activeLEDs, displayValue } = useMemo(() => {
    const pct = ((localValue - min) / (max - min)) * 100
    const ledCount = 10
    const active = Math.ceil((pct / 100) * ledCount)
    const display = localValue.toFixed(step < 1 ? 1 : 0)
    return { activeLEDs: active, displayValue: display }
  }, [localValue, min, max, step])

  // Memoize LED configurations to avoid recalculating on every render
  // OPTIMIZED: Removed shadows from individual LEDs for performance
  const ledConfigs = useMemo(() => {
    const ledCount = 10
    return Array.from({ length: ledCount }, (_, index) => {
      const isActive = index < activeLEDs
      let colorClass = 'bg-retro-border'

      if (isActive) {
        const ledPercentage = (index / ledCount) * 100
        if (ledPercentage < 60) colorClass = 'bg-neon-green'
        else if (ledPercentage < 85) colorClass = 'bg-led-yellow'
        else colorClass = 'bg-led-red'
      }

      return { isActive, colorClass }
    })
  }, [activeLEDs])

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-mono-retro text-neon-cyan uppercase tracking-wider">
          {label}
        </label>
        <span className="text-xs font-mono-retro text-neon-cyan/70 tabular-nums">
          {displayValue}
        </span>
      </div>

      <Slider.Root
        value={[localValue]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        className="relative flex items-center w-full h-5"
      >
        <Slider.Track className="relative h-1 w-full bg-retro-border border border-retro-border/50 rounded-full">
          <Slider.Range className="absolute h-full bg-gradient-to-r from-neon-cyan/50 to-neon-cyan rounded-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-5 h-5 bg-gradient-to-br from-gray-300 to-gray-500 border-2 border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)] rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-neon-cyan transition-transform" />
      </Slider.Root>

      {/* LED Level Indicators (VU Meter style) - Removed animate-pulse for performance */}
      {showLEDs && (
        <div className="flex gap-1 justify-between mt-1">
          {ledConfigs.map((config, index) => (
            <div
              key={index}
              className={cn(
                'w-full h-1.5 rounded-sm transition-colors duration-150',
                config.colorClass
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
})
