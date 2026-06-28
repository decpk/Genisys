import { memo } from 'react'
import { ChevronRight, ListChecks } from 'lucide-react'

import { cn } from '@/lib/utils'

import { AIPlanTodoRow } from './AIPlanTodoRow'
import { aiPlanProgressStyles as styles } from './AIPlanProgress.styles'
import type { AIPlanProgressProps } from './AIPlanProgress.types'
import { useAIPlanProgressData } from './useAIPlanProgressData'

/**
 * VS Code-style "Todos" card driven by the assistant's published plan.
 *
 * Header: `Todos (done/total)` with a chevron and a checklist icon.
 * Body:   one compact `AIPlanTodoRow` per plan step — no progress
 *         bar, no numbered chips, no vertical connector.
 *
 * Rendered above the (separately collapsed) tool-call audit trail by
 * both `ChatMessageBubble` and the AI Assistant `MessageBubble`.
 */
export const AIPlanProgress = memo(function AIPlanProgress(
  props: AIPlanProgressProps,
): React.JSX.Element | null {
  const { steps, className } = props
  const { doneCount, total, expanded, toggleExpanded } =
    useAIPlanProgressData(steps)

  if (total === 0) return null

  const chevronClass = cn(
    styles.headerChevron,
    expanded && styles.headerChevronOpen,
  )

  return (
    <div className={cn(styles.root, className)}>
      <button type="button" onClick={toggleExpanded} className={styles.header}>
        <ChevronRight size={12} className={chevronClass} />
        <span className={styles.headerTitle}>
          {`Todos (${doneCount}/${total})`}
        </span>
        <ListChecks size={12} className={styles.headerIcon} />
      </button>
      {expanded && (
        <div className={styles.body}>
          {steps.map((step) => (
            <AIPlanTodoRow key={step.id} step={step} />
          ))}
        </div>
      )}
    </div>
  )
})
