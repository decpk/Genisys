import { memo } from 'react'

import { aiPlanTodoRowStyles as styles } from './AIPlanTodoRow.styles'
import type { AIPlanTodoRowProps } from './AIPlanTodoRow.types'
import { pickStatusIcon } from './utils/pickStatusIcon'

/**
 * Single VS Code-style todo row used inside `AIPlanProgress`.
 *
 * Renders a status icon + the step title — no numbered chip, no
 * vertical connector — kept intentionally minimal to match the
 * VS Code "Todos" panel.
 */
export const AIPlanTodoRow = memo(function AIPlanTodoRow(
  props: AIPlanTodoRowProps,
): React.JSX.Element {
  const { step } = props
  const icon = pickStatusIcon(step.status)
  return (
    <div className={styles.root}>
      <span className={styles.iconWrap}>{icon}</span>
      <span className={styles.label}>{step.title}</span>
    </div>
  )
})
