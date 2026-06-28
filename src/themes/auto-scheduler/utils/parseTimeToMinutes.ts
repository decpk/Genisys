export function parseTimeToMinutes(time: string): number {
  if (!time || typeof time !== 'string') return -1
  const parts = time.split(':')
  if (parts.length !== 2) return -1
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  if (isNaN(hours) || isNaN(minutes)) return -1
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1
  return hours * 60 + minutes
}
