import type { DPTask } from '../../../DailyPlan.types'

/**
 * Which flavor of TaskSection to render.
 *
 *  - `active`    → emerald identity, progress bar, quick-add input
 *  - `completed` → slate "archive shelf" identity, no progress, no quick-add
 */
export type TaskSectionVariant = 'active' | 'completed'

export interface TaskSectionProps {
  title: string
  tasks: DPTask[]
  showQuickAdd?: boolean
  defaultCollapsed?: boolean
  variant?: TaskSectionVariant
  allComplete?: boolean
}
