import type { AIPlanStep } from '../AIPlanProgress.types'

/**
 * Count how many plan steps have completed (`status === 'done'`).
 *
 * Extracted from `useAIPlanProgressData` so the summary computation
 * is a pure function — easy to test and reuse independently of the
 * React hook.
 */
export function countDoneSteps(steps: AIPlanStep[]): number {
  return steps.filter((step) => step.status === 'done').length
}
