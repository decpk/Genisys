import { useTimerStore } from '@/store/timer-store'

import type { StatsResult } from '../StatsPanel.types'
import { useStatsLoader, type StatsLoaderHook } from './useStatsLoader'
import { useStatsRange, type StatsRangeHook } from './useStatsRange'

export interface StatsPanelData extends StatsRangeHook, StatsLoaderHook {
  /** Local store fallback values when the backend stats are empty. */
  localWeekly: number[]
  localStreak: number
  effectiveStats: StatsResult
}

export function useStatsPanelData(): StatsPanelData {
  const rangeHook = useStatsRange()
  const loader = useStatsLoader(rangeHook.range)
  const localWeekly = useTimerStore((s) => s.weeklyMinutes)
  const localStreak = useTimerStore((s) => s.streakDays)

  const backendHasData =
    loader.stats.weekly.some((m) => m > 0) ||
    loader.stats.heatmap.length > 0 ||
    loader.stats.perTag.length > 0

  const effectiveStats: StatsResult = backendHasData
    ? loader.stats
    : {
        ...loader.stats,
        weekly: localWeekly,
        totals: {
          ...loader.stats.totals,
          currentStreak: localStreak,
        },
      }

  return {
    ...rangeHook,
    ...loader,
    localWeekly,
    localStreak,
    effectiveStats,
  }
}
