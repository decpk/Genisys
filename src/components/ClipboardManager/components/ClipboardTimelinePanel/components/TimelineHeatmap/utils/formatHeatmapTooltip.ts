export function formatHeatmapTooltip(dayLabel: string, hour: number, count: number): string {
  const noun = count === 1 ? 'item' : 'items'
  return `${dayLabel} ${hour}:00 — ${count} ${noun}`
}
