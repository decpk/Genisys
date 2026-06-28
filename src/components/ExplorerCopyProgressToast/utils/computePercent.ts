export function computePercent(copied: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  const raw = Math.round((copied / total) * 100)

  return Math.min(Math.max(raw, 0), 100)
}
