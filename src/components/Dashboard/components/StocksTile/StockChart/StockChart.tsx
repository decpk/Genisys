import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AppLoader } from '@/components/AppLoader'

import { pickChartColor } from '../utils/pickChartColor'
import { formatChartTickByRange } from '../utils/formatChartTickByRange'

import { StockChartTooltip, toChartSeries } from './StockChart.helpers'
import type { StockChartProps } from './StockChart.types'

export function StockChart({
  symbol,
  points,
  loading = false,
  height = 180,
  changePercent,
  currency,
  range,
}: StockChartProps): React.JSX.Element {
  const data = useMemo(() => toChartSeries(points, range), [points, range])
  const color = pickChartColor(changePercent)
  const gradientId = `stock-grad-${symbol}`

  if (loading && data.length === 0) {
    return (
      <div
        className="flex items-center justify-center w-full"
        style={{ height }}
      >
        <AppLoader />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center w-full text-xs text-muted-foreground/60"
        style={{ height }}
      >
        No price history available.
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color.stroke} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color.stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(150,150,150,0.12)"
          />
          <XAxis
            dataKey="ts"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 9, fill: 'rgba(150,150,150,0.7)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatChartTickByRange(v, range)}
            minTickGap={32}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'rgba(150,150,150,0.7)' }}
            tickLine={false}
            axisLine={false}
            width={40}
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => v.toFixed(v >= 1000 ? 0 : 2)}
          />
          <RechartsTooltip content={<StockChartTooltip currency={currency} range={range} />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color.stroke}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
