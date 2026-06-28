import { useCallback, useEffect, useState } from 'react'

import type { TimerSession } from '@/store/timer-store/timer-store.types'

import { loadHistorySessions } from '../api/loadHistorySessions'
import { removeHistorySession } from '../api/removeHistorySession'
import type { HistoryFilter } from '../HistoryPanel.types'

export interface HistoryLoaderHook {
  sessions: TimerSession[]
  isLoading: boolean
  error: string | null
  hasMore: boolean
  remove: (id: string) => Promise<void>
  reload: () => Promise<void>
}

export function useHistoryPanelLoader(
  filter: HistoryFilter,
  limit: number,
  offset: number,
): HistoryLoaderHook {
  const [sessions, setSessions] = useState<TimerSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await loadHistorySessions(filter, { limit, offset })
      if (offset === 0) {
        setSessions(result.items)
      } else {
        setSessions((prev) => [...prev, ...result.items])
      }
      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }, [filter.search, filter.tagId, filter.fromTs, filter.toTs, limit, offset])

  useEffect(() => {
    void load()
  }, [load])

  const remove = useCallback(async (id: string) => {
    await removeHistorySession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  return { sessions, isLoading, error, hasMore, remove, reload: load }
}
