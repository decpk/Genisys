export function formatGoalMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m'
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const remMin = Math.round(minutes % 60)
  if (remMin === 0) return `${hours}h`
  return `${hours}h ${remMin}m`
}
