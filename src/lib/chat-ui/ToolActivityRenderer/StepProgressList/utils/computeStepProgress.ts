import type { ToolActivity } from '../../ToolActivityRenderer.types'
import type { StepProgressSummary } from '../StepProgressList.types'

/** Pure derivation: counts + indexes for a flat activity list. */
export function computeStepProgress(activities: ToolActivity[]): StepProgressSummary {
  const total = activities.length
  let doneCount = 0
  let pendingCount = 0
  let errorCount = 0
  let runningIndex = -1

  for (let i = 0; i < total; i++) {
    const status = activities[i].status
    if (status === 'done') doneCount++
    else if (status === 'pending') pendingCount++
    else if (status === 'error') errorCount++
    else if (status === 'running' && runningIndex === -1) runningIndex = i
  }

  const hasError = errorCount > 0
  const isAllDone = total > 0 && doneCount === total

  return {
    total,
    doneCount,
    pendingCount,
    errorCount,
    runningIndex,
    isAllDone,
    hasError,
  }
}
