export function formatHourLabel(hour: number): string {
  const period = hour < 12 ? 'a' : 'p'
  const display = hour === 0 || hour === 12 ? 12 : hour % 12
  return `${display}${period}`
}
