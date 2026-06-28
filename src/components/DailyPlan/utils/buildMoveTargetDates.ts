import { getToday, getTomorrow } from './formatDate'
import { formatDateMenuLabel } from './formatDateMenuLabel'

export interface MoveTargetDates {
  today: string
  tomorrow: string
  todayLabel: string
  tomorrowLabel: string
  isToday: boolean
  isTomorrow: boolean
}

/** Compute today/tomorrow target dates and visibility flags for a scheduled item */
export function buildMoveTargetDates(scheduledDate: string): MoveTargetDates {
  const today = getToday()
  const tomorrow = getTomorrow()
  return {
    today,
    tomorrow,
    todayLabel: formatDateMenuLabel(today),
    tomorrowLabel: formatDateMenuLabel(tomorrow),
    isToday: scheduledDate === today,
    isTomorrow: scheduledDate === tomorrow,
  }
}
