import { useState } from 'react'

import type { StatsRange } from '../StatsPanel.types'

const DAY_MS = 86_400_000

function defaultRange(): StatsRange {
  const to = Date.now()
  const from = to - 30 * DAY_MS
  return { fromTs: from, toTs: to }
}

export interface StatsRangeHook {
  range: StatsRange
  setRange: (next: StatsRange) => void
  reset: () => void
}

export function useStatsRange(): StatsRangeHook {
  const [range, setRangeState] = useState<StatsRange>(defaultRange)
  return {
    range,
    setRange: setRangeState,
    reset: () => setRangeState(defaultRange()),
  }
}
