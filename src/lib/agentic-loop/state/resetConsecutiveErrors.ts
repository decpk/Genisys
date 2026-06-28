import type { LoopState } from '../agenticLoop.types'

/** Reset `consecutiveErrors` after a successful tool result. */
export function resetConsecutiveErrors(state: LoopState): void {
  state.consecutiveErrors = 0
}
