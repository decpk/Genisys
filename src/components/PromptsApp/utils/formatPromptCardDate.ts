/**
 * Format a prompt's `updatedAt` ISO string into a short relative label
 * for use on prompt cards: "Today", "Yesterday", "3d ago", "Mar 4".
 *
 * Falls back to an empty string when the input cannot be parsed.
 */
export function formatPromptCardDate(iso: string | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime()
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime()
  const dayDiff = Math.round((startOfToday - startOfDate) / 86_400_000)

  if (dayDiff <= 0) return 'Today'
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff < 7) return `${dayDiff}d ago`
  if (dayDiff < 30) return `${Math.floor(dayDiff / 7)}w ago`

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  })
}
