import type { DndScheduleRange } from '@/frameworks/notification/dnd'
import {
  isDndActive,
  getCurrentTimeMinutes,
} from '@/frameworks/notification/dnd'
import type { DndStatusInfo } from '../DndScheduleSetting.types'

/**
 * Compute a human-readable status payload for the DND badge based on
 * the current toggle state and configured ranges.
 *
 * - `enabled === false`            → "Off"
 * - `enabled && active range hit`  → "Active now"
 * - `enabled` but no active range  → "Idle"
 */
export function getDndStatus(enabled: boolean, ranges: DndScheduleRange[]): DndStatusInfo {
  if (!enabled) {
    return { label: 'Off', variant: 'inactive' }
  }
  const active = isDndActive(ranges, getCurrentTimeMinutes())
  if (active) {
    return { label: 'Active now', variant: 'active' }
  }
  return { label: 'Idle', variant: 'inactive' }
}
