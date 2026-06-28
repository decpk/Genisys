import { AlertCircle, Check, Circle } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'

import { aiPlanTodoRowStyles as styles } from '../AIPlanTodoRow.styles'
import type { AIPlanStepStatus } from '../../AIPlanProgress.types'

/**
 * Map an `AIPlanStep` status to its VS Code-style status icon.
 *
 * Extracted as a pure function so the view stays declarative
 * (no ternaries in JSX) and the icon mapping is testable in
 * isolation per `.claude.md`.
 */
export function pickStatusIcon(
  status: AIPlanStepStatus,
): React.JSX.Element {
  if (status === 'done') {
    return <Check size={14} strokeWidth={3} className={styles.iconDone} />
  }
  if (status === 'error') {
    return <AlertCircle size={14} className={styles.iconError} />
  }
  if (status === 'running') {
    return <AppLoaderGlyph size={14} className={styles.iconRunning} />
  }
  return <Circle size={14} className={styles.iconPending} />
}
