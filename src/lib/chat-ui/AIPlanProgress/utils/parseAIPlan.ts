import { extractPlanFence } from './extractPlanFence'
import { extractStepStatuses } from './extractStepStatuses'
import type { ParsedAIPlan } from '../AIPlanProgress.types'

/**
 * Top-level parser used by Chat + AI Assistant message bubbles.
 *
 * Walks an assistant message and returns the published step list with the
 * latest status applied from `<!-- ai-step -->` markers. Returns
 * `{ hasPlan: false, steps: [] }` when no `ai-plan` fence is present.
 */
export function parseAIPlan(content: string): ParsedAIPlan {
  const baseSteps = extractPlanFence(content)
  if (baseSteps.length === 0) {
    return { hasPlan: false, steps: [] }
  }

  const statuses = extractStepStatuses(content)
  if (statuses.size === 0) {
    return { hasPlan: true, steps: baseSteps }
  }

  const steps = baseSteps.map((step) => {
    const live = statuses.get(step.id)
    if (!live) return step
    return { ...step, status: live }
  })

  return { hasPlan: true, steps }
}
