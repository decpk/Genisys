import type { DPMeeting } from '../../../DailyPlan.types'

export interface MeetingSectionProps {
  meetings: DPMeeting[]
  defaultCollapsed?: boolean
  allComplete?: boolean
}
