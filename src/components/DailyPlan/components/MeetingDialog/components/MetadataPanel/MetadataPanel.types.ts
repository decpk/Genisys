import type { DPMeetingFormData } from '../../../../DailyPlan.types'

export interface MetadataPanelProps {
  formData: DPMeetingFormData
  onFieldChange: (field: keyof DPMeetingFormData, value: string | null) => void
  parseDate: (dateStr: string) => Date
  parseTime: (timeStr: string) => Date
  formatTime: (date: Date) => string
}
