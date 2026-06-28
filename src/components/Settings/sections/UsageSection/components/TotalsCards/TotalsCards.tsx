import { memo } from 'react'

import { cn } from '@/lib/utils'

import { buildTotalsCards } from './utils/buildTotalsCards'
import type { TotalsCardsProps } from './TotalsCards.types'

export const TotalsCards = memo(function TotalsCards(
  props: TotalsCardsProps,
): React.JSX.Element {
  const cards = buildTotalsCards(props)

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => {
        const valueClass = cn(
          'mt-1 font-semibold tabular-nums',
          card.headline ? 'text-2xl text-primary' : 'text-xl text-foreground',
        )
        return (
          <div
            key={card.key}
            className="rounded-xl border border-border/60 bg-card px-4 py-3"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {card.label}
            </p>
            <p className={valueClass}>{card.value}</p>
          </div>
        )
      })}
    </div>
  )
})
