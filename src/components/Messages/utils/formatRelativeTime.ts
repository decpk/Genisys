// Format a millisecond timestamp into a compact relative label for
// conversation rows (e.g. "now", "5m", "3h", "Mon", "6/12").
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) {
    return new Date(timestamp).toLocaleDateString(undefined, {
      weekday: 'short',
    })
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'numeric',
    day: 'numeric',
  })
}
