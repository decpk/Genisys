import { TrendingDown, TrendingUp } from 'lucide-react'

import { formatChangeAbs } from '../utils/formatChangeAbs'
import { formatChangePct } from '../utils/formatChangePct'
import { formatStockPrice } from '../utils/formatStockPrice'
import { pickChartColor } from '../utils/pickChartColor'
import type { StockQuote } from '@/store/stocks-tile-store'

export interface StockQuickStatsProps {
  symbol: string
  quote: StockQuote | undefined
  compact?: boolean
}

function computeChangeAbs(quote: StockQuote | undefined): number | null {
  if (!quote) return null
  if (!Number.isFinite(quote.price) || !Number.isFinite(quote.prevClose)) return null
  return quote.price - quote.prevClose
}

export function StockQuickStats({
  symbol,
  quote,
  compact = false,
}: StockQuickStatsProps): React.JSX.Element {
  const changePct = quote?.changePct ?? null
  const color = pickChartColor(changePct)
  const Trend = (changePct ?? 0) >= 0 ? TrendingUp : TrendingDown
  const changeAbs = computeChangeAbs(quote)

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {formatStockPrice(quote?.price ?? null, quote?.currency)}
        </span>
        <span className={`inline-flex items-center gap-0.5 text-[10px] tabular-nums ${color.textClass}`}>
          <Trend size={10} />
          {formatChangePct(changePct)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {formatStockPrice(quote?.price ?? null, quote?.currency)}
      </span>
      <span className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${color.textClass}`}>
        <Trend size={12} />
        {formatChangeAbs(changeAbs, quote?.currency)}
        <span className="opacity-70">({formatChangePct(changePct)})</span>
      </span>
      <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground/50">
        {symbol}
      </span>
    </div>
  )
}
