import type { ToolActivity } from '../ToolActivityRenderer.types'

/** Counts derived from a list of activities (computed by `computeStepProgress`). */
export interface StepProgressSummary {
  total: number
  doneCount: number
  pendingCount: number
  errorCount: number
  /** Zero-based index of the first activity whose status is `running`, or `-1` when none is running. */
  runningIndex: number
  isAllDone: boolean
  hasError: boolean
}

export interface StepProgressListProps {
  /** Activities to render \u2014 order is preserved. */
  activities: ToolActivity[]
  /** Extra classes appended to the wrapper. */
  className?: string
}
