/**
 * Returns a human-friendly relative time string like "4h ago", "Yesterday", "Updated Saturday", etc.
 */
export function relativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 1) return '0s ago'
  if (diffMins < 1) return `${diffSecs}s ago`
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' })
  }
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short'
  })
}

/**
 * Get the first A-Z letter from a string, defaulting to '?'
 */
function getFirstLetter(str: string): string {
  return (str.match(/[A-Za-z]/) || ['?'])[0].toUpperCase()
}

/**
 * Get initials from a display name (e.g., "Sanjna Umesh" → "SU")
 */
export function getInitials(name: string | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return getFirstLetter(parts[0])
  return (getFirstLetter(parts[0]) + getFirstLetter(parts[parts.length - 1])).toUpperCase()
}

/**
 * Strip refs/heads/ prefix from branch names
 */
export function stripRefPrefix(ref: string): string {
  return ref.replace('refs/heads/', '')
}

/**
 * Generate a deterministic avatar background color from a name.
 */
const AVATAR_HUES = [210, 270, 170, 35, 350, 150, 190, 240, 25, 330]

export function avatarColor(name: string | undefined): string {
  if (!name) return `hsl(${AVATAR_HUES[0]} 50% 45%)`
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  const hue = AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length]
  return `hsl(${hue} 50% 45%)`
}
