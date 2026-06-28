import { format, subDays } from 'date-fns'

import type { UsageRange } from '@/lib/usage'

import type { UsageRangePreset } from '../UsageSection.types'

/**
 * Converts a UI range preset into a `UsageRange` understood by the
 * backend. Dates are local `YYYY-MM-DD`.
 * - `today`  → from/to = today
 * - `week`   → from = 6 days ago, to = today (last 7 days inclusive)
 * - `all`    → undefined (no bounds)
 */
export function presetToRange(preset: UsageRangePreset): UsageRange | undefined {
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')

  if (preset === 'today') {
    return { fromDate: today, toDate: today }
  }

  if (preset === 'week') {
    return { fromDate: format(subDays(now, 6), 'yyyy-MM-dd'), toDate: today }
  }

  return undefined
}
