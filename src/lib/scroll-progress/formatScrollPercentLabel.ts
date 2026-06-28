/**
 * Formats a scroll-progress fraction (0–1) as a rounded percentage label, e.g.
 * 0.423 → "42%". Clamped to the [0, 1] range.
 */
export function formatScrollPercentLabel(progress: number): string {
  let clamped = progress
  if (clamped < 0) clamped = 0
  else if (clamped > 1) clamped = 1
  return `${Math.round(clamped * 100)}%`
}
