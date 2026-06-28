import type {
  WindowPosition,
  WindowSize,
} from '@/store/settings-drawer-store'

/**
 * Clamps `position` so that a window of `size` stays inside `viewport`.
 * Used to rescue persisted positions that became off-screen after a
 * monitor change or window resize. A minimum overlap of `MIN_VISIBLE`
 * pixels is enforced on every edge so the user can always grab the
 * header to move it back.
 */
const MIN_VISIBLE = 80

export function clampToViewport(
  position: WindowPosition,
  size: WindowSize,
  viewport: { width: number; height: number },
): WindowPosition {
  const maxX = viewport.width - MIN_VISIBLE
  const maxY = viewport.height - MIN_VISIBLE
  const minX = MIN_VISIBLE - size.width
  const minY = 0
  return {
    x: Math.min(Math.max(position.x, minX), maxX),
    y: Math.min(Math.max(position.y, minY), maxY),
  }
}
