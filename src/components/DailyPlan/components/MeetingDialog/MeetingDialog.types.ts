import type { DPMeeting, DPMeetingFormData, DPMeetingStatus, DPMeetingType, DPMeetingPriority } from '../../DailyPlan.types'

export interface MeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editMeeting?: DPMeeting | null
  defaultOverrides?: Partial<DPMeetingFormData>
}

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

export const MEETING_STATUS_OPTIONS: SelectOption<DPMeetingStatus>[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'no_show', label: 'No Show' },
  { value: 'rescheduled', label: 'Rescheduled' },
]

export const MEETING_TYPE_OPTIONS: SelectOption<DPMeetingType>[] = [
  { value: 'general', label: 'General' },
  { value: 'one_on_one', label: '1:1' },
  { value: 'standup', label: 'Standup' },
  { value: 'review', label: 'Review' },
  { value: 'planning', label: 'Planning' },
  { value: 'retrospective', label: 'Retrospective' },
  { value: 'interview', label: 'Interview' },
  { value: 'client_call', label: 'Client Call' },
  { value: 'team', label: 'Team' },
  { value: 'workshop', label: 'Workshop' },
]

export const MEETING_PRIORITY_OPTIONS: SelectOption<DPMeetingPriority>[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]
