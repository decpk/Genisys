export interface ParsedRef {
  name: string
  type: 'head' | 'branch' | 'tag'
}

export function parseRefs(refs: string): ParsedRef[] {
  if (!refs.trim()) return []

  return refs.split(', ').map((ref) => {
    const trimmed = ref.trim()

    if (trimmed.startsWith('HEAD -> ')) {
      return { name: trimmed.replace('HEAD -> ', ''), type: 'head' as const }
    }
    if (trimmed.startsWith('tag: ')) {
      return { name: trimmed.replace('tag: ', ''), type: 'tag' as const }
    }
    return { name: trimmed, type: 'branch' as const }
  })
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6' // blue
] as const

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
