import type { DPWorkHoursFormData } from '../../../DailyPlan.types'

export function getDefaultWorkHoursFormData(): DPWorkHoursFormData {
  return {
    workStartTime: null,
    workEndTime: null,
    lunchStartTime: null,
    lunchEndTime: null,
  }
}
