export function computeGoalProgress(achieved: number, target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0
  if (!Number.isFinite(achieved) || achieved <= 0) return 0
  const ratio = achieved / target
  if (ratio < 0) return 0
  if (ratio > 1) return 1
  return ratio
}
