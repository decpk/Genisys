export function formatCategoryTooltip(label: string, count: number, total: number): string {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const noun = count === 1 ? 'item' : 'items'
  return `${label} · ${count} ${noun} (${pct}%)`
}
