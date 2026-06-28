import type { ToolActivity } from '../ToolActivityRenderer.types'

export interface StepProgressActivityProps {
  /** The activity to render. */
  activity: ToolActivity
  /** Zero-based position within the parent list. */
  index: number
  /** Total step count (used to hide the connector on the last row). */
  total: number
}
