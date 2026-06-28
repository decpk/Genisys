import type { PriorityBreakdown } from '../ProductivityAnalytics.types'

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

const PRIORITY_ORDER = ['low', 'medium', 'high', 'urgent']

export function computePriorityBreakdown(
  allTasks: Record<string, unknown>[],
): PriorityBreakdown[] {
  const map = new Map<string, { total: number; completed: number }>()

  for (const priority of PRIORITY_ORDER) {
    map.set(priority, { total: 0, completed: 0 })
  }

  for (const t of allTasks) {
    const priority = (t as any).priority as string
    if (!priority || !map.has(priority)) continue
    const entry = map.get(priority)!
    entry.total++
    if ((t as any).status === 'completed') entry.completed++
  }

  const result: PriorityBreakdown[] = []
  for (const priority of PRIORITY_ORDER) {
    const stats = map.get(priority)!
    result.push({
      priority,
      label: PRIORITY_LABELS[priority] || priority,
      total: stats.total,
      completed: stats.completed,
      pct: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    })
  }

  return result
}
