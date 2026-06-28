import type { DndScheduleRange } from '@/frameworks/notification/dnd'

/**
 * Props for a single editable DND range row.
 *
 * The row is "controlled" — it owns no state; all changes are
 * propagated up via `onUpdate` / `onRemove`.
 */
export interface DndRangeRowProps {
  range: DndScheduleRange
  index: number
  onUpdate: (id: string, field: 'startTime' | 'endTime', value: string) => void
  onRemove: (id: string) => void
}
