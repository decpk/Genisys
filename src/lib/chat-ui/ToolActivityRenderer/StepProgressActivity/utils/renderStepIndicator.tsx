import { Check, AlertCircle } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { cn } from '@/lib/utils'

import type { ToolActivity } from '../../ToolActivityRenderer.types'
import { stepProgressActivityStyles as styles } from '../StepProgressActivity.styles'

/**
 * Renders the leading indicator for a single step row.
 *
 * - `pending`  -> numbered circle, muted
 * - `running`  -> animated loader (no number) in primary color
 * - `done`     -> check mark, emerald
 * - `error`    -> alert icon, destructive
 *
 * Index is 1-based when shown to the user.
 */
export function renderStepIndicator(
  activity: ToolActivity,
  index: number,
): React.JSX.Element {
  const number = index + 1

  if (activity.status === 'running') {
    return (
      <span className={cn(styles.indicator, styles.indicatorRunning)}>
        <AppLoaderGlyph size={6} />
      </span>
    )
  }

  if (activity.status === 'done') {
    return (
      <span className={cn(styles.indicator, styles.indicatorDone)}>
        <Check size={6} strokeWidth={3.5} />
      </span>
    )
  }

  if (activity.status === 'error') {
    return (
      <span className={cn(styles.indicator, styles.indicatorError)}>
        <AlertCircle size={6} />
      </span>
    )
  }

  // pending (or unknown) — show numbered hollow circle
  return (
    <span className={cn(styles.indicator, styles.indicatorPending)}>
      <span className={styles.indicatorNumber}>{number}</span>
    </span>
  )
}
