import type { DPMeetingStatus, DPMeetingPriority } from '../../DailyPlan.types'
import { sectionWellStyles } from './shared/styles/sectionWell.styles'

export const MEETING_STATUS_CONFIG: Record<DPMeetingStatus, { label: string; color: string; bg: string; border: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  in_progress: { label: 'In Progress', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  completed: { label: 'Done', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  postponed: { label: 'Postponed', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  no_show: { label: 'No Show', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  rescheduled: { label: 'Rescheduled', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
}

export const MEETING_PRIORITY_CARD_CLASS: Record<DPMeetingPriority, string> = {
  low: 'bg-blue-500/[0.03] border-blue-500/10 hover:bg-blue-500/[0.07] hover:border-blue-500/20',
  medium: 'bg-blue-500/[0.03] border-blue-500/10 hover:bg-blue-500/[0.07] hover:border-blue-500/20',
  high: 'bg-orange-500/[0.04] border-orange-500/15 hover:bg-orange-500/[0.08] hover:border-orange-500/25',
  critical: 'bg-red-500/[0.04] border-red-500/15 hover:bg-red-500/[0.08] hover:border-red-500/25',
}

export const meetingSectionStyles = {
  // Card list — slightly more breathing room than the previous design
  cardList: `${sectionWellStyles.well}`,

  // Empty state
  emptyContainer:
    'flex flex-col items-center justify-center py-8 text-muted-foreground',
  emptyIcon: 'size-8 mb-2 opacity-20',
  emptyText: 'text-xs',
} as const
