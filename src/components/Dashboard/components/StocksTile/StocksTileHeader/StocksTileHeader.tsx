import { GripVertical, Plus, RefreshCw, TrendingUp, Zap } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'

import { TileResizeMenu } from '../../TileResizeMenu'

import type { StocksTileHeaderProps } from './StocksTileHeader.types'

export function StocksTileHeader({
  tileWidth,
  onWidthChange,
  dragHandleProps,
  anyLoading,
  autoRefreshEnabled,
  onToggleAutoRefresh,
  onRefreshAll,
  onAdd,
  itemCount,
}: StocksTileHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30 shrink-0">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
        <TrendingUp size={14} className="text-primary" />
      </div>
      <span className="text-sm font-semibold tracking-tight text-foreground">
        Stocks
      </span>
      {itemCount > 0 && (
        <span className="text-[10px] text-muted-foreground/50 ml-1">
          {itemCount} ticker{itemCount !== 1 ? 's' : ''}
        </span>
      )}

      <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Tooltip content="Add ticker" side="bottom">
          <IconButton onClick={onAdd} variant="ghost" size="xs">
            <Plus size={13} />
          </IconButton>
        </Tooltip>
        <Tooltip content={autoRefreshEnabled ? 'Auto-refresh on' : 'Auto-refresh off'} side="bottom">
          <IconButton
            onClick={() => onToggleAutoRefresh(!autoRefreshEnabled)}
            variant="ghost"
            size="xs"
            className={autoRefreshEnabled ? 'text-amber-500' : undefined}
          >
            <Zap size={13} />
          </IconButton>
        </Tooltip>
        <Button
          onClick={onRefreshAll}
          disabled={anyLoading}
          variant="ghost"
          size="xs"
        >
          <span className="w-3 h-3 flex items-center justify-center">
            {anyLoading ? <AppLoaderGlyph size={12} /> : <RefreshCw size={12} />}
          </span>
          Refresh
        </Button>
        <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} iconSize={13} />
        <IconButton
          tooltip="Drag to reorder"
          tooltipSide="bottom"
          size="xs"
          className="cursor-grab active:cursor-grabbing"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={13} />
        </IconButton>
      </div>
    </div>
  )
}
