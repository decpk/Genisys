import { memo, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { cn } from '@/lib/utils'

import { ExpandableToolActivity } from './ExpandableToolActivity'
import { InlineToolActivity } from './InlineToolActivity'
import { StepProgressList } from './StepProgressList'
import { toolActivityRendererStyles as styles } from './ToolActivityRenderer.styles'
import type { ToolActivityRendererProps } from './ToolActivityRenderer.types'

/** Plural-aware "1 tool" / "2 tools" suffix. */
function pluralize(count: number, singular: string): string {
  if (count === 1) return `1 ${singular}`
  return `${count} ${singular}s`
}

/**
 * Shared renderer for AI tool executions.
 * Used by Chat and every AI Assistant right-panel surface.
 *
 * Modes:
 *  - `steps`      VS Code-style numbered timeline (default in Chat + AI Assistant).
 *  - `expandable` Legacy collapsible block (header + per-row details).
 *  - `inline`     Minimal one-line-per-activity list.
 */
export const ToolActivityRenderer = memo(function ToolActivityRenderer(
  props: ToolActivityRendererProps,
): React.JSX.Element | null {
  const { activities, mode = 'steps', className } = props
  const [expanded, setExpanded] = useState(false)

  if (activities.length === 0) return null

  if (mode === 'steps') {
    return <StepProgressList activities={activities} className={className} />
  }

  if (mode === 'inline') {
    return (
      <div className={cn(styles.inlineRoot, className)}>
        {activities.map((a) => (
          <InlineToolActivity key={a.id} activity={a} />
        ))}
      </div>
    )
  }

  const doneCount = activities.filter((a) => a.status === 'done').length
  const isAllDone = doneCount === activities.length

  let headerIcon: React.ReactNode = (
    <AppLoaderGlyph size={12} className={styles.runningIcon} />
  )
  if (isAllDone) headerIcon = <Check size={12} className={styles.doneIcon} />

  let headerText = `Running tools… (${doneCount}/${activities.length})`
  if (isAllDone) headerText = `Used ${pluralize(activities.length, 'tool')}`

  return (
    <div className={cn(styles.expandableRoot, className)}>
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className={styles.expandableHeader}
      >
        <ChevronRight
          size={12}
          className={cn(
            styles.expandableHeaderChevron,
            expanded && styles.expandableHeaderChevronOpen,
          )}
        />
        {headerIcon}
        <span className={styles.expandableHeaderText}>{headerText}</span>
      </button>
      {expanded && (
        <div className={styles.expandableList}>
          {activities.map((a) => (
            <ExpandableToolActivity key={a.id} activity={a} />
          ))}
        </div>
      )}
    </div>
  )
})
