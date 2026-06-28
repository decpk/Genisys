import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { useStocksTileStore } from '@/store/stocks-tile-store'
import type { AddStockInput, StockRange, StockWatchItem } from '@/store/stocks-tile-store'

import { AddStockDialog } from './AddStockDialog'
import { EditStockDialog } from './EditStockDialog'
import { EmptyStocksState } from './EmptyStocksState'
import { useStocksTileAlerts } from './hooks/useStocksTileAlerts'
import { useStocksTileAutoRefresh } from './hooks/useStocksTileAutoRefresh'
import { useStocksTileData } from './hooks/useStocksTileData'
import { useStocksTileFetch } from './hooks/useStocksTileFetch'
import { STOCKS_ALL_TAB, useStocksTileTabs } from './hooks/useStocksTileTabs'
import { StockDetailView } from './StockDetailView'
import { StocksOverviewList } from './StocksOverviewList'
import { StockTabPill } from './StockTabPill'
import type { StocksTileProps } from './StocksTile.types'
import { StocksTileHeader } from './StocksTileHeader'

export const StocksTile = memo(function StocksTile({
  tileWidth,
  onWidthChange,
  dragHandleProps,
}: StocksTileProps): React.JSX.Element {
  const tile = useStocksTileStore((s) => s.tile)
  const items = useStocksTileStore((s) => s.items)
  const quoteBySymbol = useStocksTileStore((s) => s.quoteBySymbol)
  const historyBySymbol = useStocksTileStore((s) => s.historyBySymbol)
  const newsByItem = useStocksTileStore((s) => s.newsByItem)
  const loadingByItem = useStocksTileStore((s) => s.loadingByItem)

  const addItem = useStocksTileStore((s) => s.addItem)
  const updateItem = useStocksTileStore((s) => s.updateItem)
  const removeItem = useStocksTileStore((s) => s.removeItem)
  const setAutoRefreshEnabled = useStocksTileStore((s) => s.setAutoRefreshEnabled)

  const { fetchAllFor } = useStocksTileFetch()
  const { activeTab, setActiveTab, isAllTab } = useStocksTileTabs()

  useStocksTileData()
  useStocksTileAutoRefresh()
  useStocksTileAlerts()

  const [rangeBySymbol, setRangeBySymbol] = useState<Record<string, StockRange>>({})
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StockWatchItem | null>(null)
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // If active tab gets removed, fall back to overview
  useEffect(() => {
    if (!isAllTab && !items.find((it) => it.id === activeTab)) {
      setActiveTab(STOCKS_ALL_TAB)
    }
  }, [activeTab, items, isAllTab, setActiveTab])

  const handleHoverEnter = useCallback((id: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    setHoveredTabId(id)
  }, [])

  const handleHoverLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setHoveredTabId(null), 150)
  }, [])

  const handleAddStock = useCallback(
    (input: AddStockInput) => {
      const id = addItem(input)
      if (!id) return
      setActiveTab(id)
      setTimeout(() => fetchAllFor(id, input.symbol, { force: true }).catch(() => {}), 50)
    },
    [addItem, setActiveTab, fetchAllFor],
  )

  const handleRefreshAll = useCallback(() => {
    for (const item of items) {
      fetchAllFor(item.id, item.symbol, { force: true }).catch(() => {})
    }
  }, [items, fetchAllFor])

  const handleSelectItem = useCallback(
    (id: string) => {
      setActiveTab(id)
    },
    [setActiveTab],
  )

  const handleRemove = useCallback(
    (id: string) => {
      removeItem(id)
      if (activeTab === id) setActiveTab(STOCKS_ALL_TAB)
    },
    [removeItem, activeTab, setActiveTab],
  )

  const anyLoading = Object.values(loadingByItem).some(Boolean)
  const activeItem = !isAllTab ? items.find((it) => it.id === activeTab) ?? null : null
  const activeRange: StockRange = (activeItem && rangeBySymbol[activeItem.symbol]) ?? '1d'

  if (!tile) {
    // Should never render — the registry guards on tile presence — but
    // guard for safety.
    return <div className="hidden" />
  }

  return (
    <div className="@container group relative border border-border rounded-lg bg-card overflow-hidden flex flex-col h-[400px]">
      <StocksTileHeader
        tileWidth={tileWidth}
        onWidthChange={onWidthChange}
        dragHandleProps={dragHandleProps}
        anyLoading={anyLoading}
        autoRefreshEnabled={tile.autoRefreshEnabled}
        onToggleAutoRefresh={setAutoRefreshEnabled}
        onRefreshAll={handleRefreshAll}
        onAdd={() => setIsAddOpen(true)}
        itemCount={items.length}
      />

      {items.length > 0 && (
        <div className="relative shrink-0 border-b border-border/20">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-card to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-card to-transparent z-10" />

          <div className="flex items-center gap-1 px-3 py-1.5 overflow-x-auto scrollbar-none scroll-smooth">
            <button
              type="button"
              onClick={() => setActiveTab(STOCKS_ALL_TAB)}
              className={`
                shrink-0 inline-flex items-center gap-1 rounded-full px-3 h-7 text-xs font-medium transition-all duration-200 cursor-pointer select-none
                ${isAllTab
                  ? 'bg-primary/10 text-foreground border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
                }
              `}
            >
              All
              <span className="text-[10px] leading-none opacity-50">{items.length}</span>
            </button>

            {items.length > 0 && (
              <div className="w-px h-4 bg-border/30 shrink-0 mx-0.5" />
            )}

            {items.map((item) => (
              <StockTabPill
                key={item.id}
                item={item}
                quote={quoteBySymbol[item.symbol]}
                active={activeTab === item.id}
                loading={loadingByItem[item.id] ?? false}
                hoverOpen={hoveredTabId === item.id}
                onActivate={() => setActiveTab(item.id)}
                onEdit={() => {
                  setHoveredTabId(null)
                  setEditingItem(item)
                }}
                onRemove={() => {
                  setHoveredTabId(null)
                  handleRemove(item.id)
                }}
                onMouseEnter={() => handleHoverEnter(item.id)}
                onMouseLeave={handleHoverLeave}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        {items.length === 0 ? (
          <EmptyStocksState onAdd={() => setIsAddOpen(true)} />
        ) : isAllTab ? (
          <StocksOverviewList
            items={items}
            quoteBySymbol={quoteBySymbol}
            historyBySymbol={historyBySymbol}
            loadingByItem={loadingByItem}
            onSelectItem={handleSelectItem}
          />
        ) : activeItem ? (
          <StockDetailView
            item={activeItem}
            quote={quoteBySymbol[activeItem.symbol]}
            range={activeRange}
            onRangeChange={(r) =>
              setRangeBySymbol((prev) => ({ ...prev, [activeItem.symbol]: r }))
            }
            historyByRange={historyBySymbol[activeItem.symbol] ?? {}}
            news={newsByItem[activeItem.id] ?? []}
            loading={loadingByItem[activeItem.id] ?? false}
            onRefresh={() =>
              fetchAllFor(activeItem.id, activeItem.symbol, { force: true }).catch(() => {})
            }
          />
        ) : null}
      </div>

      <AddStockDialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        existingSymbols={items.map((i) => i.symbol)}
        onAdd={handleAddStock}
      />
      <EditStockDialog
        isOpen={editingItem !== null}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(id, patch) => updateItem(id, patch)}
      />
    </div>
  )
})
