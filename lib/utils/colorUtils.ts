// lib/utils/colorUtils.ts

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string (e.g., '#ff0000')
 * @returns Object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  const cleanHex = hex.replace('#', '')

  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  return { r, g, b }
}

/**
 * Interpolate between two hex colors
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @param factor - Interpolation factor (0-1)
 * @returns Interpolated hex color
 */
export function lerpColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1)
  const c2 = hexToRgb(color2)

  const r = Math.round(c1.r + (c2.r - c1.r) * factor)
  const g = Math.round(c1.g + (c2.g - c1.g) * factor)
  const b = Math.round(c1.b + (c2.b - c1.b) * factor)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Convert hex color to rgba string
 * @param hex - Hex color string
 * @param alpha - Alpha value (0-1)
 * @returns rgba string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Multiply color brightness
 * @param hex - Hex color string
 * @param scalar - Brightness multiplier
 * @returns New hex color
 */
export function multiplyColor(hex: string, scalar: number): string {
  const { r, g, b } = hexToRgb(hex)
  const newR = Math.min(255, Math.round(r * scalar))
  const newG = Math.min(255, Math.round(g * scalar))
  const newB = Math.min(255, Math.round(b * scalar))
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}
