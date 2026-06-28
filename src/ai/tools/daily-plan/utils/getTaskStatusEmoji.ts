import type { DPTaskStatus } from '@/components/DailyPlan/DailyPlan.types'

/** Map a task status to its display emoji. */
export function getTaskStatusEmoji(status: DPTaskStatus): string {
  if (status === 'completed') return '✅'
  if (status === 'in_progress') return '🔄'
  return '⬜'
}
