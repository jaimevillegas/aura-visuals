/**
 * Throttle function - limits function calls to once per specified delay
 * Performance optimization for high-frequency events like slider changes
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  let timeoutId: NodeJS.Timeout | null = null

  return function throttled(...args: Parameters<T>) {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    // Clear any pending timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (timeSinceLastCall >= delay) {
      // Enough time has passed, call immediately
      lastCall = now
      func(...args)
    } else {
      // Schedule a call for when the delay period is over
      timeoutId = setTimeout(() => {
        lastCall = Date.now()
        func(...args)
        timeoutId = null
      }, delay - timeSinceLastCall)
    }
  }
}
