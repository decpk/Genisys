import { cn } from '@/lib/utils'

import type { ToolActivity } from '../../ToolActivityRenderer.types'
import { stepProgressActivityStyles as styles } from '../StepProgressActivity.styles'

/**
 * Returns the composed Tailwind class string for the row's content area.
 * Encodes interactivity (cursor) and the per-status text color/weight.
 */
export function getStepRowClass(
  activity: ToolActivity,
  hasResult: boolean,
): string {
  const interactivity = hasResult
    ? styles.contentRowInteractive
    : styles.contentRowStatic

  let statusClass: string = styles.contentRowDone
  if (activity.status === 'pending') statusClass = styles.contentRowPending
  else if (activity.status === 'running') statusClass = styles.contentRowRunning
  else if (activity.status === 'error') statusClass = styles.contentRowError

  return cn(styles.contentRow, interactivity, statusClass)
}
