import type { LoopState } from '../agenticLoop.types'

/**
 * Increment the count for `hash` and bump `totalToolCalls`. Returns the new
 * count for this hash so callers can decide whether to dedup.
 */
export function recordToolCall(state: LoopState, hash: string): number {
  const previous = state.toolCallCounts.get(hash) ?? 0
  const next = previous + 1
  state.toolCallCounts.set(hash, next)
  state.totalToolCalls += 1
  return next
}
