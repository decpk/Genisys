import type { LoopState } from '../agenticLoop.types'

/**
 * Reset the iteration counter — used by `onContinueRequired` callers that
 * want to grant the loop another budget without losing tool-call history.
 */
export function resetBudget(state: LoopState): void {
  state.iteration = 0
}
