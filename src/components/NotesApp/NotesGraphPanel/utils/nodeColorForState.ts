/**
 * Resolve a node's CSS color from its current state. Selected notes get an
 * accent color; unresolved (missing) link targets render muted.
 */
export function nodeColorForState(isSelected: boolean, isUnresolved = false): string {
  if (isSelected) return '#6366f1'
  if (isUnresolved) return '#cbd5e1'
  return '#64748b'
}
