import type { StopPredicate } from './predicate.types'

/**
 * Stop when the same `name + args` hash has been requested more than
 * `limit` times. This is the safety net behind the per-call dedup notice
 * injected by `executeToolCall`; in practice, the loop usually doesn't
 * surface this stop because the dedup notice nudges the model to a final
 * answer first.
 */
export function isRepeatedToolCall(limit: number): StopPredicate {
  return (ctx) => {
    const hash = ctx.lastToolHash
    if (!hash) return { shouldStop: false }
    const count = ctx.state.toolCallCounts.get(hash) ?? 0
    if (count > limit) {
      return {
        shouldStop: true,
        reason: 'repeated-tool-call',
        errorMessage: `Repeated tool call '${hash}' exceeded the limit of ${limit}.`,
      }
    }
    return { shouldStop: false }
  }
}
