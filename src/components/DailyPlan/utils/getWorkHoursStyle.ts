import type { DPWorkHoursFormData } from '../DailyPlan.types'

interface WorkHoursRegion {
  topPx: number
  heightPx: number
}

interface WorkHoursLayout {
  workSegments: WorkHoursRegion[]
  lunchRegion: WorkHoursRegion | null
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function getWorkHoursLayout(
  hours: DPWorkHoursFormData | undefined,
  hourHeight: number,
  startHour: number,
): WorkHoursLayout {
  if (!hours) return { workSegments: [], lunchRegion: null }

  const workStart = hours.workStartTime
  const workEnd = hours.workEndTime
  const hasWorkHours = workStart !== null || workEnd !== null

  if (!hasWorkHours) return { workSegments: [], lunchRegion: null }

  const startMinutes = workStart ? timeToMinutes(workStart) : 0
  const endMinutes = workEnd ? timeToMinutes(workEnd) : 24 * 60 - 1

  let lunchRegion: WorkHoursRegion | null = null
  const hasLunch = hours.lunchStartTime && hours.lunchEndTime

  if (hasLunch) {
    const lunchStartMin = timeToMinutes(hours.lunchStartTime!)
    const lunchEndMin = timeToMinutes(hours.lunchEndTime!)
    const lunchTop = ((lunchStartMin / 60) - startHour) * hourHeight
    const lunchHeight = ((lunchEndMin - lunchStartMin) / 60) * hourHeight
    lunchRegion = { topPx: lunchTop, heightPx: lunchHeight }

    const lunchStartClamped = Math.max(lunchStartMin, startMinutes)
    const lunchEndClamped = Math.min(lunchEndMin, endMinutes)

    const segments: WorkHoursRegion[] = []

    if (startMinutes < lunchStartClamped) {
      const top = ((startMinutes / 60) - startHour) * hourHeight
      const height = ((lunchStartClamped - startMinutes) / 60) * hourHeight
      segments.push({ topPx: top, heightPx: height })
    }

    if (lunchEndClamped < endMinutes) {
      const top = ((lunchEndClamped / 60) - startHour) * hourHeight
      const height = ((endMinutes - lunchEndClamped) / 60) * hourHeight
      segments.push({ topPx: top, heightPx: height })
    }

    return { workSegments: segments, lunchRegion }
  }

  const topPx = ((startMinutes / 60) - startHour) * hourHeight
  const heightPx = ((endMinutes - startMinutes) / 60) * hourHeight

  return { workSegments: [{ topPx, heightPx }], lunchRegion: null }
}
