import type { DPPriority } from '../../DailyPlan.types'

const PRIORITY_DOT_COLOR_MAP: Record<DPPriority, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

/** Pure: returns hex color for the priority dot in week mini cards. */
export function getTaskPriorityDotColor(priority: DPPriority): string {
  return PRIORITY_DOT_COLOR_MAP[priority]
}
