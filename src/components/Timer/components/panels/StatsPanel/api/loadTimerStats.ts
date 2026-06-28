import type { StatsRange, StatsResult } from '../StatsPanel.types'

interface MaybeApi {
  getTimerStats?: (range?: unknown) => Promise<unknown>
}

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

export async function loadTimerStats(range: StatsRange): Promise<StatsResult> {
  const api = (window as unknown as { api?: MaybeApi }).api
  if (typeof api?.getTimerStats !== 'function') return EMPTY
  try {
    const result = (await api.getTimerStats(range)) as Partial<StatsResult> | undefined
    if (!result) return EMPTY
    return {
      weekly: Array.isArray(result.weekly) ? result.weekly : EMPTY.weekly,
      heatmap: Array.isArray(result.heatmap) ? result.heatmap : EMPTY.heatmap,
      totals: result.totals ?? EMPTY.totals,
      perTag: Array.isArray(result.perTag) ? result.perTag : EMPTY.perTag,
    }
  } catch {
    return EMPTY
  }
}
