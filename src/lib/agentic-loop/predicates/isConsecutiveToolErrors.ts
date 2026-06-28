import type { StopPredicate } from './predicate.types'

/**
 * Stop when `consecutiveErrors` exceeds `limit` — i.e. the model has hit
 * `limit + 1` tool errors in a row without a successful tool result.
 */
export function isConsecutiveToolErrors(limit: number): StopPredicate {
  return (ctx) => {
    if (ctx.state.consecutiveErrors > limit) {
      return {
        shouldStop: true,
        reason: 'consecutive-tool-errors',
        errorMessage: `Aborting after ${ctx.state.consecutiveErrors} consecutive tool errors.`,
      }
    }
    return { shouldStop: false }
  }
}
