const HOUR_HEIGHT = 60
const START_HOUR = 0
const SNAP_INTERVAL = 15
const MAX_MINUTES = 24 * 60 - SNAP_INTERVAL

/** Convert a Y pixel offset (relative to the timeline container) to minutes from midnight, snapped to the nearest 15-minute interval. */
export function pixelToSnappedMinutes(y: number): number {
  const clampedY = Math.max(0, y)
  const totalMinutes = (clampedY / HOUR_HEIGHT) * 60 + START_HOUR * 60
  const snapped = Math.round(totalMinutes / SNAP_INTERVAL) * SNAP_INTERVAL
  return Math.max(0, Math.min(MAX_MINUTES, snapped))
}
