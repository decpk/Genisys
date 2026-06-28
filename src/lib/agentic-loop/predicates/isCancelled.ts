import type { StopPredicate } from './predicate.types'

/**
 * Stop the loop when the host-supplied `isCancelled` predicate returns
 * true. When `isCancelled` is omitted, this predicate is a no-op.
 */
export function isCancelled(isCancelledFn?: () => boolean): StopPredicate {
  return () => {
    if (isCancelledFn?.() === true) {
      return {
        shouldStop: true,
        reason: 'cancelled',
        errorMessage: 'Cancelled by user.',
      }
    }
    return { shouldStop: false }
  }
}
