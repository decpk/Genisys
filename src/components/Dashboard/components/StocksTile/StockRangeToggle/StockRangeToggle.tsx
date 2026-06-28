import type { StockRange } from '@/store/stocks-tile-store'
import { STOCK_RANGES } from '@/store/stocks-tile-store'

export interface StockRangeToggleProps {
  value: StockRange
  onChange: (range: StockRange) => void
  ranges?: readonly StockRange[]
  className?: string
}

const RANGE_LABEL: Record<StockRange, string> = {
  '1d': '1D',
  '7d': '1W',
  '14d': '2W',
  '1m': '1M',
  '1y': '1Y',
  max: 'MAX',
}

export function StockRangeToggle({
  value,
  onChange,
  ranges = STOCK_RANGES,
  className = '',
}: StockRangeToggleProps): React.JSX.Element {
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-md border border-border/30 bg-secondary/30 p-0.5 ${className}`}
      role="tablist"
    >
      {ranges.map((r) => {
        const active = r === value
        return (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r)}
            className={`
              h-5 px-1.5 rounded text-[10px] font-semibold leading-none transition-colors cursor-pointer
              ${active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {RANGE_LABEL[r]}
          </button>
        )
      })}
    </div>
  )
}
