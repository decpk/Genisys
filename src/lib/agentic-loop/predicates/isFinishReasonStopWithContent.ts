import type { StopPredicate } from './predicate.types'

/**
 * Stop when the model returned `finishReason === 'stop'` AND emitted some
 * assistant content — even if it also asked for tool calls. This guards
 * against models that occasionally emit a final answer alongside leftover
 * tool calls; we treat the answer as authoritative.
 */
export function isFinishReasonStopWithContent(): StopPredicate {
  return (ctx) => {
    const result = ctx.lastResult
    if (!result) return { shouldStop: false }
    const trimmed = result.content.trim()
    if (result.finishReason === 'stop' && trimmed.length > 0) {
      return {
        shouldStop: true,
        reason: 'finish-reason-stop-with-content',
        finalContent: result.content,
      }
    }
    return { shouldStop: false }
  }
}
