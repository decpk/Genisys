/**
 * Formats an ISO timestamp as a compact relative label: "just now", "5m ago",
 * "2h ago", "3d ago". Older than a week falls back to a short locale date.
 */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''

  const diffSeconds = Math.floor((Date.now() - then) / 1000)

  if (diffSeconds < 45) return 'just now'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return new Date(then).toLocaleDateString()
}
