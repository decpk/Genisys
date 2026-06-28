import { format, parseISO } from 'date-fns'

import type { UsageDayStat } from '@/lib/usage'

import type { TrendDatum } from '../TrendChart.types'

/** Maps daily stats into chronologically-ordered chart points. */
export function buildTrendSeries(perDay: UsageDayStat[]): TrendDatum[] {
  return [...perDay]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((day) => ({
      label: format(parseISO(day.date), 'MMM d'),
      foregroundMs: day.foregroundMs,
    }))
}
