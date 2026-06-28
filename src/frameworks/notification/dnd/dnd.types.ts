// ─── DND Types (declaration only — no runtime values) ──────────────

/**
 * A single Do Not Disturb time range.
 *
 * - `startTime` and `endTime` are in `"HH:mm"` 24-hour format.
 * - When `startTime > endTime`, the range is treated as wrapping past
 *   midnight (e.g. `22:00 → 08:00`).
 * - When `startTime === endTime`, the range is treated as inactive
 *   (zero-length) and is ignored by the scheduler.
 */
export interface DndScheduleRange {
  id: string
  startTime: string
  endTime: string
}

/**
 * Persisted DND configuration shape stored under `AppData.settings.dnd`.
 */
export interface DndConfig {
  enabled: boolean
  ranges: DndScheduleRange[]
}
