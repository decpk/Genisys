/**
 * Generates a unique identifier for a `DndScheduleRange`.
 *
 * Format: `dnd-range-<timestamp>-<random>` — matches the convention
 * used by other schedule-range generators (e.g. theme scheduler).
 */
export function generateDndRangeId(): string {
  return `dnd-range-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
