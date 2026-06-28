import type { StopPredicate } from './predicate.types'

/**
 * Stop when `state.iteration` has reached `limit`. The agentic loop checks
 * this at the top of each turn; when it fires, the host may either give up
 * or invoke `onContinueRequired` to keep going.
 */
export function isMaxIterationsReached(limit: number): StopPredicate {
  return (ctx) => {
    if (ctx.state.iteration >= limit) {
      return {
        shouldStop: true,
        reason: 'max-iterations',
      }
    }
    return { shouldStop: false }
  }
}
