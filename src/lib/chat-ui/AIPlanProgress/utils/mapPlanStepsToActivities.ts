import type { ToolActivity } from '../../ToolActivityRenderer'
import type { AIPlanStep } from '../AIPlanProgress.types'

/**
 * Adapts the model's published plan steps into the shared `ToolActivity`
 * shape so we can reuse `StepProgressList` for the plan-progress card.
 *
 * The `toolName: 'plan-step'` is purely a sentinel — `label` is what the
 * UI shows and there is no real tool icon for these rows.
 */
export function mapPlanStepsToActivities(steps: AIPlanStep[]): ToolActivity[] {
  return steps.map((step) => ({
    id: `plan-step-${step.id}`,
    toolName: 'plan-step',
    label: step.title,
    status: step.status,
    argSummary: step.detail,
  }))
}
