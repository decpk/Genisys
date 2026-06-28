import type { StopPredicate } from './predicate.types'

/**
 * Stop the loop when the model emitted no tool calls in its latest
 * response — that means it produced a final assistant answer.
 */
export function isNoNewToolCalls(): StopPredicate {
  return (ctx) => {
    const result = ctx.lastResult
    if (!result) return { shouldStop: false }
    if (result.toolCalls.length === 0) {
      return {
        shouldStop: true,
        reason: 'no-new-tool-calls',
        finalContent: result.content,
      }
    }
    return { shouldStop: false }
  }
}
