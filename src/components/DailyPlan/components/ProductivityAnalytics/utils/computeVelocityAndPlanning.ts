/**
 * Computes two metrics:
 * - avgVelocityHours: average time (hours) between createdAt and completedAt for completed tasks
 * - planningScore: % of tasks where createdAt date < scheduledDate (planned ahead)
 */
export function computeVelocityAndPlanning(
  allTasks: Record<string, unknown>[],
): { avgVelocityHours: number; planningScore: number } {
  let velocitySum = 0
  let velocityCount = 0
  let plannedCount = 0
  let totalWithSchedule = 0

  for (const t of allTasks) {
    const createdAt = (t as any).createdAt as string | undefined
    const completedAt = (t as any).completedAt as string | undefined
    const scheduledDate = (t as any).scheduledDate as string | undefined

    // Velocity: time from creation to completion
    if (createdAt && completedAt) {
      const created = new Date(createdAt)
      const completed = new Date(completedAt)
      if (!isNaN(created.getTime()) && !isNaN(completed.getTime())) {
        const diffMs = completed.getTime() - created.getTime()
        if (diffMs >= 0) {
          velocitySum += diffMs / (1000 * 60 * 60) // convert to hours
          velocityCount++
        }
      }
    }

    // Planning score: was the task created before its scheduled date?
    if (createdAt && scheduledDate) {
      totalWithSchedule++
      const createdDateStr = createdAt.slice(0, 10) // YYYY-MM-DD portion
      if (createdDateStr < scheduledDate) {
        plannedCount++
      }
    }
  }

  const avgVelocityHours = velocityCount > 0
    ? Math.round((velocitySum / velocityCount) * 10) / 10
    : 0

  const planningScore = totalWithSchedule > 0
    ? Math.round((plannedCount / totalWithSchedule) * 100)
    : 0

  return { avgVelocityHours, planningScore }
}
