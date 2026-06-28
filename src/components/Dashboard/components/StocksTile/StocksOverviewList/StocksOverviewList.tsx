import { AppLoaderGlyph } from '@/components/AppLoader'

import { StockChart } from '../StockChart'
import { StockQuickStats } from '../StockQuickStats'

import type { StocksOverviewListProps } from './StocksOverviewList.types'

export function StocksOverviewList({
  items,
  quoteBySymbol,
  historyBySymbol,
  loadingByItem,
  onSelectItem,
}: StocksOverviewListProps): React.JSX.Element {
  return (
    <div className="flex flex-col divide-y divide-border/30">
      {items.map((item) => {
        const quote = quoteBySymbol[item.symbol]
        const points = historyBySymbol[item.symbol]?.['1d'] ?? []
        const loading = loadingByItem[item.id] ?? false
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
            className="group/row text-left px-3 py-2 hover:bg-accent/30 transition-colors duration-150 cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-primary">
                  {item.symbol.slice(0, 4)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">
                  {item.shortName || item.symbol}
                </div>
                {item.shortName && (
                  <div className="text-[10px] text-muted-foreground/60 truncate">
                    {item.symbol}
                  </div>
                )}
              </div>
              {loading && (
                <span className="text-muted-foreground/60">
                  <AppLoaderGlyph size={11} />
                </span>
              )}
              <StockQuickStats symbol={item.symbol} quote={quote} compact />
            </div>
            <div className="-mx-1">
              <StockChart
                symbol={`overview-${item.symbol}`}
                points={points}
                loading={loading && points.length === 0}
                changePercent={quote?.changePct ?? null}
                currency={quote?.currency ?? null}
                range="1d"
                height={56}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}
