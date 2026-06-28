import { memo, useState } from 'react'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import { toolActivityRendererStyles as styles } from '../ToolActivityRenderer.styles'
import { renderStatusIcon } from '../utils/renderStatusIcon'
import type { ExpandableToolActivityProps } from './ExpandableToolActivity.types'

/** Single expandable activity row (label + args + collapsible result). */
export const ExpandableToolActivity = memo(function ExpandableToolActivity(
  props: ExpandableToolActivityProps,
): React.JSX.Element {
  const { activity } = props
  const [showResult, setShowResult] = useState(false)
  const hasResult = Boolean(activity.result)
  const label = activity.label ?? activity.toolName

  const rowClass = cn(
    styles.expandableItemRow,
    hasResult ? styles.expandableItemRowInteractive : styles.expandableItemRowStatic,
  )

  let argsNode: React.ReactNode = null
  if (activity.argSummary) {
    argsNode = <span className={styles.expandableItemArgs}>{activity.argSummary}</span>
  }

  let chevronNode: React.ReactNode = null
  if (hasResult) {
    chevronNode = (
      <ChevronRight
        size={10}
        className={cn(
          styles.expandableItemChevron,
          showResult && styles.expandableItemChevronOpen,
        )}
      />
    )
  }

  let resultNode: React.ReactNode = null
  if (showResult && hasResult) {
    resultNode = <pre className={styles.expandableItemResult}>{activity.result}</pre>
  }

  const handleClick = (): void => {
    if (hasResult) setShowResult((o) => !o)
  }

  return (
    <div className={styles.expandableItem}>
      <button type="button" onClick={handleClick} className={rowClass}>
        {renderStatusIcon(activity, 11)}
        <span className={styles.expandableItemLabel}>{label}</span>
        {argsNode}
        {chevronNode}
      </button>
      {resultNode}
    </div>
  )
})
