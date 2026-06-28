import { memo } from 'react'
import { Check, AlertCircle, ChevronRight } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { cn } from '@/lib/utils'

import { StepProgressActivity } from '../StepProgressActivity'
import { stepProgressListStyles as styles } from './StepProgressList.styles'
import type { StepProgressListProps } from './StepProgressList.types'
import { useStepProgressListData } from './useStepProgressListData'

/** Pick the header status icon based on the summary (extracted to avoid ternaries in JSX). */
function pickHeaderIcon(
  isAllDone: boolean,
  hasError: boolean,
): React.JSX.Element {
  if (hasError) {
    return <AlertCircle size={10} className={styles.headerStatusIconError} />
  }
  if (isAllDone) {
    return <Check size={10} className={styles.headerStatusIconDone} />
  }
  return <AppLoaderGlyph size={10} className={styles.headerStatusIconRunning} />
}

/** Pick progress-fill color class. */
function pickProgressFillClass(
  isAllDone: boolean,
  hasError: boolean,
): string {
  if (hasError) return cn(styles.progressFill, styles.progressFillError)
  if (isAllDone) return cn(styles.progressFill, styles.progressFillDone)
  return styles.progressFill
}

/**
 * VS Code-style numbered tool timeline.
 *
 * Renders:
 *  - A header showing `Tool N of M \u2014 <current label>` (or `N tools used`)
 *    with a status icon and a small count chip.
 *  - A 2px progress track underneath the header.
 *  - A collapsed-by-default body containing a numbered timeline
 *    with vertical connector lines between steps.
 */
export const StepProgressList = memo(function StepProgressList(
  props: StepProgressListProps,
): React.JSX.Element | null {
  const { activities, className } = props
  const { summary, headerText, expanded, toggleExpanded, progressPercent } =
    useStepProgressListData(activities)

  if (activities.length === 0) return null

  const { isAllDone, hasError, total } = summary
  const headerIcon = pickHeaderIcon(isAllDone, hasError)
  const progressFillClass = pickProgressFillClass(isAllDone, hasError)

  const chevronClass = cn(
    styles.headerChevron,
    expanded && styles.headerChevronOpen,
  )

  const countText = `${summary.doneCount}/${total}`

  return (
    <div className={cn(styles.root, className)}>
      <button type="button" onClick={toggleExpanded} className={styles.header}>
        <ChevronRight size={10} className={chevronClass} />
        {headerIcon}
        <span className={styles.headerTitle}>{headerText}</span>
        <span className={styles.headerCount}>{countText}</span>
      </button>

      <div className={styles.progressTrack}>
        <div
          className={progressFillClass}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {expanded && (
        <div className={styles.body}>
          {activities.map((activity, index) => (
            <StepProgressActivity
              key={activity.id}
              activity={activity}
              index={index}
              total={total}
            />
          ))}
        </div>
      )}
    </div>
  )
})
