export function computeHeatmapIntensity(count: number, maxCount: number): number {
  if (maxCount === 0 || count === 0) return 0
  const ratio = count / maxCount
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}
