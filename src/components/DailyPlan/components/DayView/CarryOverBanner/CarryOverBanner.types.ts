import type { DPTask, DPReview, DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

export type CarryOverItemType = 'task' | 'review' | 'meeting'

export type CarryOverEntry =
  | { type: 'task'; data: DPTask }
  | { type: 'review'; data: DPReview }
  | { type: 'meeting'; data: DPMeeting }

export interface CarryOverBannerView {
  visible: boolean
  isExpanded: boolean
  toggleExpanded: () => void
  entries: CarryOverEntry[]
  count: number
  moveEntry: (entry: CarryOverEntry) => void
  moveAll: () => void
  copyEntry: (entry: CarryOverEntry) => void
  copyAll: () => void
  dismiss: () => void
}
