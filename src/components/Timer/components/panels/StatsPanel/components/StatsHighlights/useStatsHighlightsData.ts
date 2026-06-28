import { useMemo } from 'react'
import { Award, CalendarRange, Hash, Tag } from 'lucide-react'

import { formatMinutesShort } from '../../utils/formatMinutesShort'
import type {
  HighlightTileData,
  StatsHighlightsProps,
  StatsHighlightsViewModel,
} from './StatsHighlights.types'
import { computeDailyAverageMinutes } from './utils/computeDailyAverageMinutes'
import { countActiveDays } from './utils/countActiveDays'
import { findBestHeatmapDay } from './utils/findBestHeatmapDay'
import { findTopTag } from './utils/findTopTag'
import { formatHighlightDateLabel } from './utils/formatHighlightDateLabel'

const RANGE_DAYS = 30

export function useStatsHighlightsData(
  props: StatsHighlightsProps,
): StatsHighlightsViewModel {
  const { totals, heatmap, perTag } = props

  const bestDay = useMemo(() => findBestHeatmapDay(heatmap), [heatmap])
  const activeDays = useMemo(() => countActiveDays(heatmap), [heatmap])
  const topTag = useMemo(() => findTopTag(perTag), [perTag])

  const dailyAverage = computeDailyAverageMinutes(
    totals.totalFocusMinutes,
    RANGE_DAYS,
  )

  const tiles: HighlightTileData[] = []

  if (bestDay) {
    tiles.push({
      key: 'best-day',
      icon: Award,
      label: 'Best day',
      value: formatMinutesShort(bestDay.minutes),
      subLabel: formatHighlightDateLabel(bestDay.dateKey),
    })
  }

  tiles.push({
    key: 'daily-avg',
    icon: CalendarRange,
    label: 'Daily avg',
    value: formatMinutesShort(dailyAverage),
    subLabel: 'last 30d',
  })

  tiles.push({
    key: 'active-days',
    icon: Hash,
    label: 'Active days',
    value: String(activeDays),
    subLabel: `of ${RANGE_DAYS}`,
  })

  if (topTag) {
    tiles.push({
      key: 'top-tag',
      icon: Tag,
      label: 'Top tag',
      value: topTag.label,
      subLabel: formatMinutesShort(topTag.minutes),
    })
  }

  const hasData = totals.totalFocusMinutes > 0 || tiles.some((t) => t.key === 'best-day')

  return { hasData, tiles }
}
