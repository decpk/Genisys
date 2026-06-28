import { useEffect, useState } from 'react'

import { loadTimerStats } from '../api/loadTimerStats'
import type { StatsRange, StatsResult } from '../StatsPanel.types'

const EMPTY: StatsResult = {
  weekly: [0, 0, 0, 0, 0, 0, 0],
  heatmap: [],
  totals: {
    totalFocusMinutes: 0,
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
  perTag: [],
}

export interface StatsLoaderHook {
  stats: StatsResult
  isLoading: boolean
  error: string | null
}

export function useStatsLoader(range: StatsRange): StatsLoaderHook {
  const [stats, setStats] = useState<StatsResult>(EMPTY)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    loadTimerStats(range)
      .then((result) => {
        if (cancelled) return
        setStats(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load stats')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [range.fromTs, range.toTs])

  return { stats, isLoading, error }
}
