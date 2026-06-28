import type { DPTask, DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

export type DPSearchResultItem =
  | { type: 'task'; data: DPTask }
  | { type: 'meeting'; data: DPMeeting }
