import type { StockHistoryPoint, StockRange } from '@/store/stocks-tile-store'

import { formatStockPrice } from '../utils/formatStockPrice'
import { formatChartTooltipDate } from '../utils/formatChartTooltipDate'

export interface StockChartSeriesPoint {
  ts: number
  price: number
  label: string
}

interface ChartTooltipPayload {
  payload?: StockChartSeriesPoint
  value?: number
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipPayload[]
  currency?: string | null
  range?: StockRange
}

function fmtLabel(ts: number): string {
  const d = new Date(ts)
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString(
    undefined,
    { hour: 'numeric', minute: '2-digit' },
  )}`
}

export function StockChartTooltip({
  active,
  payload,
  currency,
  range,
}: ChartTooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null
  const datum = payload[0]?.payload
  if (!datum) return null
  return (
    <div className="rounded-md border border-border bg-card px-2 py-1 shadow-md text-[10px] leading-tight">
      <div className="font-semibold tabular-nums">
        {formatStockPrice(datum.price, currency)}
      </div>
      <div className="text-muted-foreground">
        {range ? formatChartTooltipDate(datum.ts, range) : fmtLabel(datum.ts)}
      </div>
    </div>
  )
}

export function toChartSeries(
  points: StockHistoryPoint[],
  range: StockRange,
): StockChartSeriesPoint[] {
  return points
    .filter((p) => Number.isFinite(p.c))
    .map((p) => ({
      ts: p.t * 1000,
      price: p.c,
      label: formatChartTooltipDate(p.t * 1000, range),
    }))
}
