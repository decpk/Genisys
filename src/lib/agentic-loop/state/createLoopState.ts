import type { LoopState } from '../agenticLoop.types'

/** Build a fresh `LoopState`. */
export function createLoopState(): LoopState {
  return {
    iteration: 0,
    toolCallCounts: new Map<string, number>(),
    consecutiveErrors: 0,
    totalToolCalls: 0,
  }
}
