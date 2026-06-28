import { cn } from '@/lib/utils'
import type { DPMeeting } from '../../../../DailyPlan.types'
import { formatTimeRange } from '../../../../utils/formatTime'
import { computeDurationLabel } from '../../utils/computeDurationLabel'
import {
  getPriorityVisual,
  COMPLETED_PRIORITY_VISUAL,
} from '../../shared/priority'
import { getMeetingStatusPillStyle } from './utils/getMeetingStatusPillStyle'
import { getMeetingTypeLabel } from './utils/getMeetingTypeLabel'
import { meetingCardStyles as s, MEETING_STATUS_LABELS } from './MeetingCard.styles'
import type { MeetingCardDataReturn, MeetingCardFlags } from './MeetingCard.types'

interface UseMeetingCardDataArgs {
  meeting: DPMeeting
  onEdit: (meeting: DPMeeting) => void
}

export function useMeetingCardData(args: UseMeetingCardDataArgs): MeetingCardDataReturn {
  const { meeting, onEdit } = args

  const flags: MeetingCardFlags = {
    isCancelled: meeting.status === 'cancelled',
    isCompleted: meeting.status === 'completed',
    isNoShow: meeting.status === 'no_show',
    hasNotes: meeting.notes.length > 0,
    hasFollowUp: meeting.followUp.length > 0,
    hasAgenda: meeting.agenda.length > 0,
    hasDescription: meeting.description.length > 0,
    hasLocation: meeting.location.length > 0,
    hasLink: meeting.meetingLink.length > 0,
    showTypeBadge: meeting.meetingType !== 'general',
  }

  const duration = computeDurationLabel(meeting.startTime, meeting.endTime)
  const timeRangeText = formatTimeRange(meeting.startTime, meeting.endTime)
  const statusLabel = MEETING_STATUS_LABELS[meeting.status]
  const statusPillClass = getMeetingStatusPillStyle(meeting.status)
  const typeLabel = getMeetingTypeLabel(meeting.meetingType)
  const isInactive = flags.isCancelled || flags.isCompleted || flags.isNoShow
  const priorityVisual = isInactive
    ? COMPLETED_PRIORITY_VISUAL
    : getPriorityVisual(meeting.priority)

  let titleClass = s.title
  if (flags.isCancelled || flags.isNoShow) {
    titleClass = cn(s.title, s.titleCancelled)
  } else if (flags.isCompleted) {
    titleClass = cn(s.title, s.titleCompleted)
  }

  let cardClass: string = s.container
  if (flags.isCancelled || flags.isNoShow) {
    cardClass = cn(cardClass, s.cancelled)
  } else if (flags.isCompleted) {
    cardClass = cn(cardClass, s.completed)
  }

  function handleDoubleClick() {
    onEdit(meeting)
  }

  return {
    flags,
    duration,
    statusLabel,
    statusPillClass,
    typeLabel,
    priorityVisual,
    showPriorityDot: !isInactive,
    titleClass,
    cardClass,
    timeRangeText,
    handleDoubleClick,
  }
}
