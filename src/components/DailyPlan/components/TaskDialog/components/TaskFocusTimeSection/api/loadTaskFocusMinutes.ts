import type { TimerSession } from '@/store/timer-store/timer-store.types'

interface MaybeApi {
  loadTimerSessions?: (
    filter?: unknown,
    pagination?: unknown,
  ) => Promise<{ items: TimerSession[]; hasMore: boolean }>
}

export interface TaskFocusMinutesResult {
  totalMinutes: number
  sessionCount: number
}

export async function loadTaskFocusMinutes(
  dailyPlanTaskId: string,
): Promise<TaskFocusMinutesResult> {
  const api = (window as unknown as { api?: MaybeApi }).api
  if (typeof api?.loadTimerSessions !== 'function') {
    return { totalMinutes: 0, sessionCount: 0 }
  }
  try {
    const result = await api.loadTimerSessions(
      { daily_plan_task_id: dailyPlanTaskId },
      { limit: 1000, offset: 0 },
    )
    const items = Array.isArray(result?.items) ? result.items : []
    const totalSeconds = items.reduce(
      (sum, s) => sum + (Number(s?.durationSec) || 0),
      0,
    )
    return {
      totalMinutes: Math.floor(totalSeconds / 60),
      sessionCount: items.length,
    }
  } catch {
    return { totalMinutes: 0, sessionCount: 0 }
  }
}
