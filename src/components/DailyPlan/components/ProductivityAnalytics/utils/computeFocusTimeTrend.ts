import type { FocusTimeTrendPoint } from '../ProductivityAnalytics.types'
import type { DPDailyEntry, DPWorkHoursFormData } from '../../../DailyPlan.types'
import { getEffectiveWorkHours } from '../../../utils/getEffectiveWorkHours'
import { formatDateShort } from '../../../utils/formatDate'
import { safeMeetingMinutes } from './safeMeetingMinutes'

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function computeFocusTimeTrend(
  dates: string[],
  meetingsByDate: Record<string, Record<string, unknown>[]>,
  dailyEntries: Record<string, DPDailyEntry>,
  globalDefaults: DPWorkHoursFormData,
): { trend: FocusTimeTrendPoint[]; avgFocusMinutes: number } {
  const trend: FocusTimeTrendPoint[] = []
  let focusSum = 0
  let focusCount = 0

  for (const date of dates) {
    const entry = dailyEntries[date]
    const effective = getEffectiveWorkHours(entry, globalDefaults)

    const workStart = effective.workStartTime
    const workEnd = effective.workEndTime

    if (!workStart || !workEnd) {
      trend.push({ date, label: formatDateShort(date), focusMinutes: 0 })
      continue
    }

    const totalWorkMinutes = timeToMinutes(workEnd) - timeToMinutes(workStart)
    const lunchMinutes = effective.lunchStartTime && effective.lunchEndTime
      ? timeToMinutes(effective.lunchEndTime) - timeToMinutes(effective.lunchStartTime)
      : 0

    const dateMeetings = meetingsByDate[date] || []
    const meetingMinutes = dateMeetings.reduce(
      (acc: number, m) => acc + safeMeetingMinutes(m),
      0,
    )

    const focusMinutes = Math.max(totalWorkMinutes - lunchMinutes - meetingMinutes, 0)
    trend.push({ date, label: formatDateShort(date), focusMinutes })
    focusSum += focusMinutes
    focusCount++
  }

  const avgFocusMinutes = focusCount > 0 ? Math.round(focusSum / focusCount) : 0

  return { trend, avgFocusMinutes }
}
