/**
 * Computes the background style for a heatmap cell from its 0..1
 * intensity. Empty cells get a faint muted fill; active cells blend the
 * primary color proportionally.
 */
export function heatCellStyle(intensity: number): React.CSSProperties {
  if (intensity <= 0) {
    return { backgroundColor: 'color-mix(in srgb, var(--color-muted) 40%, transparent)' }
  }
  const percent = Math.max(12, Math.round(intensity * 100))
  return {
    backgroundColor: `color-mix(in srgb, var(--color-primary) ${percent}%, transparent)`,
  }
}
