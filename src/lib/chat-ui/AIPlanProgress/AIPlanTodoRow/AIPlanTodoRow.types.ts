import type { AIPlanStep } from '../AIPlanProgress.types'

/** Props for the `AIPlanTodoRow` view component. */
export interface AIPlanTodoRowProps {
  /** Single plan step to render as a VS Code-style todo row. */
  step: AIPlanStep
}
