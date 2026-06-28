import type { ClipboardItem } from '@/store/clipboard-store'
import type { WorkSession } from './sessions.types'

const DEFAULT_GAP_MINUTES = 15

export function detectSessions(
  items: ClipboardItem[],
  gapMinutes: number = DEFAULT_GAP_MINUTES
): WorkSession[] {
  if (items.length === 0) return []

  const sorted = [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const gapMs = gapMinutes * 60 * 1000
  const sessions: WorkSession[] = []
  let currentItems: ClipboardItem[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i++) {
    const prevTime = new Date(sorted[i - 1].createdAt).getTime()
    const currTime = new Date(sorted[i].createdAt).getTime()
    const gap = currTime - prevTime

    if (gap > gapMs) {
      sessions.push(buildSession(currentItems, sessions.length))
      currentItems = [sorted[i]]
    } else {
      currentItems.push(sorted[i])
    }
  }

  sessions.push(buildSession(currentItems, sessions.length))

  return sessions
}

function buildSession(items: ClipboardItem[], index: number): WorkSession {
  return {
    id: `session-${index}`,
    startTime: items[0].createdAt,
    endTime: items[items.length - 1].createdAt,
    items,
    label: '',
    icon: '',
    dominantCategory: null,
  }
}
