import { useMemo, useState, useCallback } from 'react'

import type { ToolActivity } from '../ToolActivityRenderer.types'
import type { StepProgressSummary } from './StepProgressList.types'
import { computeStepProgress } from './utils/computeStepProgress'
import { formatStepHeaderText } from './utils/formatStepHeaderText'

/** Hook return shape consumed by the StepProgressList view. */
export interface UseStepProgressListData {
  summary: StepProgressSummary
  headerText: string
  expanded: boolean
  toggleExpanded: () => void
  /** Percentage 0\u2013100 used by the progress bar. */
  progressPercent: number
}

/**
 * Single orchestrator hook for `StepProgressList`.
 *
 * Responsibilities:
 *  - Derive progress summary from the activities array.
 *  - Compute the header text.
 *  - Own the expanded/collapsed state of the timeline body
 *    (default: collapsed; user can click the header to expand and inspect each tool call).
 *  - Compute the progress bar percent.
 */
export function useStepProgressListData(
  activities: ToolActivity[],
): UseStepProgressListData {
  const [expanded, setExpanded] = useState(false)

  const summary = useMemo<StepProgressSummary>(
    () => computeStepProgress(activities),
    [activities],
  )

  const headerText = useMemo<string>(
    () => formatStepHeaderText(activities, summary),
    [activities, summary],
  )

  const progressPercent = useMemo<number>(() => {
    if (summary.total === 0) return 0
    return Math.round((summary.doneCount / summary.total) * 100)
  }, [summary])

  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return {
    summary,
    headerText,
    expanded,
    toggleExpanded,
    progressPercent,
  }
}
