/**
 * Estimate how many rows fit in the visible scroll viewport.
 * Used by PageUp/PageDown to advance the active item by roughly one viewport.
 * Falls back to 10 if either dimension is unavailable.
 */
export function computePageStep(container: HTMLElement | null, estimatedRowHeight: number): number {
  if (!container || estimatedRowHeight <= 0) return 10
  const visible = Math.floor(container.clientHeight / estimatedRowHeight)
  if (visible < 1) return 1
  return visible
}
