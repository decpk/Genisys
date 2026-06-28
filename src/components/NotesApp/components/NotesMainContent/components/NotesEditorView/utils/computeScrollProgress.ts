/**
 * Computes vertical scroll progress as a 0–1 fraction. Returns 0 when there is
 * no scrollable overflow (e.g. short documents). Clamped to the [0, 1] range.
 */
export function computeScrollProgress(metrics: {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}): number {
  const { scrollTop, scrollHeight, clientHeight } = metrics
  const maxScroll = scrollHeight - clientHeight
  if (maxScroll <= 0) return 0
  const progress = scrollTop / maxScroll
  if (progress < 0) return 0
  if (progress > 1) return 1
  return progress
}
