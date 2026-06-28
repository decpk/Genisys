import type { LoopState } from '../agenticLoop.types'

/** Bump `consecutiveErrors`. */
export function recordToolError(state: LoopState): void {
  state.consecutiveErrors += 1
}
