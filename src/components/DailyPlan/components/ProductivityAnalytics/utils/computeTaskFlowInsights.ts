import type { TaskFlowInsights } from '../ProductivityAnalytics.types'

/**
 * Computes high-signal "where does my work stand right now" insights:
 * - statusCounts: To Do / In Progress / Completed distribution (the work funnel)
 * - overdueCount: tasks scheduled before today that are not completed (needs attention)
 * - remainingWorkloadMinutes: estimated time left across all unfinished tasks
 */
export function computeTaskFlowInsights(
  allTasks: Record<string, unknown>[],
  todayDate: string,
): TaskFlowInsights {
  const statusCounts = { todo: 0, in_progress: 0, completed: 0 }
  let overdueCount = 0
  let remainingWorkloadMinutes = 0

  for (const t of allTasks) {
    const status = (t as any).status as string

    if (status === 'completed') {
      statusCounts.completed++
      continue
    }

    if (status === 'in_progress') statusCounts.in_progress++
    else statusCounts.todo++

    // Unfinished work: accumulate estimated remaining time and overdue count.
    const duration = Number((t as any).durationMinutes) || 0
    remainingWorkloadMinutes += duration

    const scheduledDate = (t as any).scheduledDate as string | undefined
    if (scheduledDate && scheduledDate < todayDate) overdueCount++
  }

  return {
    statusCounts,
    total: statusCounts.todo + statusCounts.in_progress + statusCounts.completed,
    overdueCount,
    remainingWorkloadMinutes,
  }
}
