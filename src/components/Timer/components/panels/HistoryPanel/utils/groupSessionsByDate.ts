import type { TimerSession } from '@/store/timer-store/timer-store.types'

import { toTimerDate } from './toTimerDate'

export interface SessionGroup {
  dateKey: string
  label: string
  items: TimerSession[]
}

function getDateKey(ts: number | string): string {
  const d = toTimerDate(ts)
  if (Number.isNaN(d.getTime())) return 'unknown'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getLabel(dateKey: string): string {
  if (dateKey === 'unknown') return 'Unknown'
  const today = new Date()
  const todayKey = getDateKey(today.getTime())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const yesterdayKey = getDateKey(yesterday.getTime())
  if (dateKey === todayKey) return 'Today'
  if (dateKey === yesterdayKey) return 'Yesterday'
  // Pretty-print as e.g. "May 3, 2026"
  const [y, m, d] = dateKey.split('-').map(Number)
  if (!y || !m || !d) return dateKey
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function groupSessionsByDate(sessions: TimerSession[]): SessionGroup[] {
  const map = new Map<string, TimerSession[]>()
  for (const s of sessions) {
    const key = getDateKey(s.completedAt as unknown as number | string)
    const arr = map.get(key) ?? []
    arr.push(s)
    map.set(key, arr)
  }
  const groups: SessionGroup[] = []
  for (const [dateKey, items] of map.entries()) {
    groups.push({ dateKey, label: getLabel(dateKey), items })
  }
  groups.sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1))
  return groups
}
