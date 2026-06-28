import { memo, useState } from 'react'
import {
  GripVertical,
  Activity, Search, X,
} from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { Tooltip } from '@/components/Tooltip'
import { useLiveScoresStore } from '@/store/live-scores-store'
import type { TileWidth } from '@/store/dashboard-store'
import type { DragHandleProps } from '../SortableTile/SortableTile.types'
import { SPORTS_CATALOG } from './sports-catalog'
import { useSettingsStore } from '@/store/settings-store'
import { TileResizeMenu } from '../TileResizeMenu'

interface LiveSportsParentTileProps {
  tileWidth: TileWidth
  onWidthChange: (width: TileWidth) => void
  dragHandleProps: DragHandleProps
}

export const LiveSportsParentTile = memo(function LiveSportsParentTile({
  tileWidth,
  onWidthChange,
  dragHandleProps,
}: LiveSportsParentTileProps): React.JSX.Element {
  const [customQuery, setCustomQuery] = useState('')
  const addSportTile = useLiveScoresStore((s) => s.addSportTile)
  const findTileByQuery = useLiveScoresStore((s) => s.findTileByQuery)
  const tileOrder = useSettingsStore((s) => s.tileOrder)
  const setTileOrder = useSettingsStore((s) => s.setTileOrder)
  const setLiveSportsTileEnabled = useSettingsStore((s) => s.setLiveSportsTileEnabled)

  const handleSportClick = (sportKey: string, defaultQuery: string): void => {
    const existing = findTileByQuery(defaultQuery)
    if (existing) {
      // Scroll to existing tile instead of duplicating
      const el = document.getElementById(`tile-${existing.id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const newId = addSportTile({ query: defaultQuery, sportKey: sportKey as any })
    // Insert the new tile right after the parent in tile order
    insertTileAfterParent(newId)
  }

  const handleCustomSubmit = (): void => {
    const q = customQuery.trim()
    if (!q) return

    const existing = findTileByQuery(q)
    if (existing) {
      const el = document.getElementById(`tile-${existing.id}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const newId = addSportTile({ query: q, sportKey: 'custom' })
    insertTileAfterParent(newId)
    setCustomQuery('')
  }

  const insertTileAfterParent = (newId: string): void => {
    const parentIdx = tileOrder.indexOf('__live_sports__')
    if (parentIdx >= 0) {
      const updated = [...tileOrder]
      updated.splice(parentIdx + 1, 0, newId)
      setTileOrder(updated)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setCustomQuery('')
    }
  }

  return (
    <div className="@container group relative border border-border rounded-lg bg-card overflow-hidden h-[400px] flex flex-col">
      {/* Action buttons — top-right, shown on hover */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <IconButton
          tooltip="Remove tile"
          tooltipSide="bottom"
          size="xs"
          onClick={() => setLiveSportsTileEnabled(false)}
        >
          <X size={14} />
        </IconButton>
        <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} />
        <IconButton
          tooltip="Drag to reorder"
          tooltipSide="bottom"
          size="xs"
          className="cursor-grab active:cursor-grabbing"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={14} />
        </IconButton>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border">
        <Activity size={16} className="text-green-500 shrink-0" />
        <h3 className="text-sm font-semibold truncate">Live Sports</h3>
        <Tooltip content="Click a sport to track live scores. Each sport creates a separate tile on your dashboard.">
          <span className="text-muted-foreground text-[10px] cursor-help">ⓘ</span>
        </Tooltip>
      </div>

      {/* Sports grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 @sm:grid-cols-3 @md:grid-cols-4 @lg:grid-cols-5 gap-2">
          {SPORTS_CATALOG.map((sport) => {
            const Icon = sport.icon
            return (
              <button
                key={sport.key}
                onClick={() => handleSportClick(sport.key, sport.defaultQuery)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <Icon size={20} className="text-muted-foreground" />
                <span className="text-xs text-foreground font-medium">{sport.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom query footer */}
      <div className="flex items-center gap-2 px-3 h-[42px] shrink-0 border-t border-border">
        <Search size={14} className="text-muted-foreground shrink-0" />
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search any sport, league, or match…"
          className="flex-1 text-xs bg-transparent border-none outline-none placeholder:text-muted-foreground/60"
        />
        <button
          onClick={handleCustomSubmit}
          disabled={!customQuery.trim()}
          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Track
        </button>
      </div>
    </div>
  )
})
