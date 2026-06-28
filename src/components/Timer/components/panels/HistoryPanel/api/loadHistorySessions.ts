import type { TimerSession } from '@/store/timer-store/timer-store.types'
import type {
  HistoryFilter,
  HistoryLoadResult,
  HistoryPagination,
} from '../HistoryPanel.types'

interface MaybeApi {
  loadTimerSessions?: (
    filter?: unknown,
    pagination?: unknown,
  ) => Promise<{ items: TimerSession[]; hasMore: boolean }>
}

export async function loadHistorySessions(
  filter: HistoryFilter,
  pagination: HistoryPagination,
): Promise<HistoryLoadResult> {
  const api = (window as unknown as { api?: MaybeApi }).api
  if (typeof api?.loadTimerSessions !== 'function') {
    return { items: [], hasMore: false }
  }
  try {
    const result = await api.loadTimerSessions(filter, pagination)
    return {
      items: Array.isArray(result?.items) ? result.items : [],
      hasMore: Boolean(result?.hasMore),
    }
  } catch {
    return { items: [], hasMore: false }
  }
}
