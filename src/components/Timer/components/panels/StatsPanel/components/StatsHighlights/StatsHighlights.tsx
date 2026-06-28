import { Sparkles } from 'lucide-react'

import { StatsHighlightsTile } from './components/StatsHighlightsTile'
import { STATS_HIGHLIGHTS_STYLES as S } from './StatsHighlights.styles'
import type { StatsHighlightsProps } from './StatsHighlights.types'
import { useStatsHighlightsData } from './useStatsHighlightsData'

export function StatsHighlights(
  props: StatsHighlightsProps,
): React.JSX.Element | null {
  const data = useStatsHighlightsData(props)

  if (!data.hasData) return null

  return (
    <section className={S.section}>
      <div className={S.header}>
        <Sparkles className="size-3 text-primary" />
        <span>Highlights</span>
      </div>
      <div className={S.grid}>
        {data.tiles.map((tile) => (
          <StatsHighlightsTile
            key={tile.key}
            icon={tile.icon}
            label={tile.label}
            value={tile.value}
            subLabel={tile.subLabel}
          />
        ))}
      </div>
    </section>
  )
}
