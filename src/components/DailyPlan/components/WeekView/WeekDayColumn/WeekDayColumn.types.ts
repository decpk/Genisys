import type { DPTask, DPMeeting } from '../../../DailyPlan.types'

export interface WeekDayColumnProps {
  day: string
  tasks: DPTask[]
  meetings: DPMeeting[]
  isSelected: boolean
  onSelect: (day: string) => void
  onToggleTask: (taskId: string, day: string) => void
}
