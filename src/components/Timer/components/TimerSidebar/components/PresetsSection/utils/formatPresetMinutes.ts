export function formatPresetMinutes(sec: number): string {
  if (sec <= 0) return '—'
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} min`
  const hours = Math.floor(min / 60)
  const remMin = min % 60
  if (remMin === 0) return `${hours}h`
  return `${hours}h ${remMin}m`
}
