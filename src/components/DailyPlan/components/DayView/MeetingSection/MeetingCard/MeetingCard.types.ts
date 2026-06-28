import type { DPMeeting } from '../../../../DailyPlan.types'
import type { PriorityVisual } from '../../shared/priority'

export interface MeetingCardProps {
  meeting: DPMeeting
  onEdit: (meeting: DPMeeting) => void
}

export interface MeetingCardFlags {
  isCancelled: boolean
  isCompleted: boolean
  isNoShow: boolean
  hasNotes: boolean
  hasFollowUp: boolean
  hasAgenda: boolean
  hasDescription: boolean
  hasLocation: boolean
  hasLink: boolean
  showTypeBadge: boolean
}

export interface MeetingCardDataReturn {
  flags: MeetingCardFlags
  duration: string
  statusLabel: string
  statusPillClass: string
  typeLabel: string
  priorityVisual: PriorityVisual
  showPriorityDot: boolean
  titleClass: string
  cardClass: string
  timeRangeText: string
  handleDoubleClick: () => void
}
