/**
 * Clamps `current / target` to a 0–100 percentage. Returns 0 when target
 * is non-positive or non-finite.
 */
export function computeProgressPct(current: number, target: number): number {
  if (!Number.isFinite(target) || target <= 0) return 0
  if (!Number.isFinite(current) || current <= 0) return 0
  const pct = (current / target) * 100
  if (pct >= 100) return 100
  return Math.round(pct)
}
