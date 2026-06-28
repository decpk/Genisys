import { Pencil, X } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { IconButton } from '@/components/ui/icon-button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { StockQuote, StockWatchItem } from '@/store/stocks-tile-store'

import { formatChangePct } from '../utils/formatChangePct'
import { pickChartColor } from '../utils/pickChartColor'

export interface StockTabPillProps {
  item: StockWatchItem
  quote: StockQuote | undefined
  active: boolean
  loading: boolean
  hoverOpen: boolean
  onActivate: () => void
  onEdit: () => void
  onRemove: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export function StockTabPill({
  item,
  quote,
  active,
  loading,
  hoverOpen,
  onActivate,
  onEdit,
  onRemove,
  onMouseEnter,
  onMouseLeave,
}: StockTabPillProps): React.JSX.Element {
  const color = pickChartColor(quote?.changePct ?? null)
  const label = item.shortName || item.symbol

  return (
    <Popover open={hoverOpen}>
      <div
        className="shrink-0 relative flex items-center"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={onActivate}
            className={`
              inline-flex items-center gap-1.5 rounded-full px-3 h-7 text-xs font-medium transition-all duration-200 cursor-pointer select-none
              ${active
                ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-foreground border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
              }
            `}
          >
            <span className="w-3 h-3 flex items-center justify-center shrink-0">
              {loading ? <AppLoaderGlyph size={11} /> : <span className="text-[10px] font-bold">$</span>}
            </span>
            <span className="font-semibold tracking-tight">{label}</span>
            {quote?.changePct !== undefined && quote?.changePct !== null && (
              <span className={`text-[10px] leading-none tabular-nums ${color.textClass}`}>
                {formatChangePct(quote.changePct)}
              </span>
            )}
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        side="top"
        className="w-auto p-1 flex items-center gap-0.5"
        sideOffset={4}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Tooltip content="Edit" side="bottom">
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            variant="ghost"
            size="xs"
          >
            <Pencil size={11} />
          </IconButton>
        </Tooltip>
        <Tooltip content="Remove" side="bottom">
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            variant="destructive"
            size="xs"
          >
            <X size={11} />
          </IconButton>
        </Tooltip>
      </PopoverContent>
    </Popover>
  )
}
