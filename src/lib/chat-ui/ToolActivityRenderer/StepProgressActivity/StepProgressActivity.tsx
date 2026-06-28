import { memo } from 'react'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { stepProgressActivityStyles as styles } from './StepProgressActivity.styles'
import type { StepProgressActivityProps } from './StepProgressActivity.types'
import { useStepProgressActivityData } from './useStepProgressActivityData'
import { getStepRowClass } from './utils/getStepRowClass'
import { renderStepIndicator } from './utils/renderStepIndicator'

/** Single timeline row \u2014 indicator + connector + label + args + collapsible result. */
export const StepProgressActivity = memo(function StepProgressActivity(
  props: StepProgressActivityProps,
): React.JSX.Element {
  const { activity, index, total } = props
  const { showResult, toggleResult } = useStepProgressActivityData()

  const hasResult = Boolean(activity.result)
  const label = activity.label ?? activity.toolName
  const isLast = index === total - 1

  const rowClass = getStepRowClass(activity, hasResult)
  const indicator = renderStepIndicator(activity, index)

  let connectorNode: React.ReactNode = null
  if (!isLast) {
    connectorNode = <span className={styles.connector} aria-hidden="true" />
  }

  let argsNode: React.ReactNode = null
  if (activity.argSummary) {
    argsNode = <span className={styles.args}>{activity.argSummary}</span>
  }

  let chevronNode: React.ReactNode = null
  if (hasResult) {
    chevronNode = (
      <ChevronRight
        size={10}
        className={cn(
          styles.resultChevron,
          showResult && styles.resultChevronOpen,
        )}
      />
    )
  }

  let resultNode: React.ReactNode = null
  if (showResult && hasResult) {
    resultNode = <pre className={styles.result}>{activity.result}</pre>
  }

  const handleClick = (): void => {
    if (hasResult) toggleResult()
  }

  return (
    <div className={styles.row}>
      {connectorNode}
      {indicator}
      <div className={styles.content}>
        <button type="button" onClick={handleClick} className={rowClass}>
          <span className={styles.label}>{label}</span>
          {argsNode}
          {chevronNode}
        </button>
        {resultNode}
      </div>
    </div>
  )
})
