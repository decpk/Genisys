import type { DPDailyEntry, DPWorkHoursFormData } from '../DailyPlan.types'

/**
 * Resolve effective work/lunch hours with field-level fallback.
 * Per-day values (from entry) take precedence; globals fill in any nulls.
 */
export function getEffectiveWorkHours(
  entry: DPDailyEntry | undefined,
  globalDefaults: DPWorkHoursFormData,
): DPWorkHoursFormData {
  return {
    workStartTime: entry?.workStartTime ?? globalDefaults.workStartTime,
    workEndTime: entry?.workEndTime ?? globalDefaults.workEndTime,
    lunchStartTime: entry?.lunchStartTime ?? globalDefaults.lunchStartTime,
    lunchEndTime: entry?.lunchEndTime ?? globalDefaults.lunchEndTime,
  }
}
