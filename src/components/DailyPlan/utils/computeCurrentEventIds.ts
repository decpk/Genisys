import type { LayoutEvent } from './computeTimelineLayout'
import { isEventCurrent } from './isEventCurrent'

/**
 * Given a list of layout events and the current time string (HH:mm),
 * returns a Set of event IDs that span the current time.
 * Only meaningful when viewing today's date.
 */
export function computeCurrentEventIds(
  layoutEvents: LayoutEvent[],
  currentTime: string,
  isToday: boolean,
): Set<string> {
  if (!isToday) return new Set()

  const ids = new Set<string>()
  for (const event of layoutEvents) {
    if (event.type === 'task' && event.task) {
      if (isEventCurrent({ type: 'task', task: event.task }, currentTime)) {
        ids.add(event.id)
      }
    } else if (event.type === 'meeting' && event.meeting) {
      if (isEventCurrent({ type: 'meeting', meeting: event.meeting }, currentTime)) {
        ids.add(event.id)
      }
    }
  }
  return ids
}
