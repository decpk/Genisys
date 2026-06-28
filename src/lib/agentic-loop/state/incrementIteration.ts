import type { LoopState } from '../agenticLoop.types'

/** Bump the iteration counter. Called once per loop turn. */
export function incrementIteration(state: LoopState): void {
  state.iteration += 1
}
