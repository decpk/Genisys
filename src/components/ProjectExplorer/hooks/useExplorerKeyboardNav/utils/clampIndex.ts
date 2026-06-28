/**
 * Clamp an integer index into the inclusive range [0, max] (where max = count - 1).
 * Returns 0 when count <= 0.
 */
export function clampIndex(index: number, count: number): number {
  if (count <= 0) return 0
  const max = count - 1
  if (index < 0) return 0
  if (index > max) return max
  return index
}
