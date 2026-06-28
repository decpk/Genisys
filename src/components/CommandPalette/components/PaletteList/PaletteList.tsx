import { useMemo } from 'react'

import type { PaletteItem } from '../../CommandPalette.types'
import { PaletteItemRow } from '../PaletteItemRow'
import type { PaletteListProps } from './PaletteList.types'
import { usePaletteListData } from './usePaletteListData'

type Row =
  | { type: 'header'; key: string; label: string }
  | { type: 'item'; key: string; item: PaletteItem; itemIndex: number }

function buildRows(items: PaletteItem[], firstNonRecentIndex: number): Row[] {
  const rows: Row[] = []
  const hasRecents = firstNonRecentIndex > 0
  const hasOthers = firstNonRecentIndex < items.length

  if (hasRecents) {
    rows.push({ type: 'header', key: 'h-recent', label: 'Recent' })
    for (let i = 0; i < firstNonRecentIndex; i++) {
      rows.push({ type: 'item', key: items[i].id, item: items[i], itemIndex: i })
    }
  }
  if (hasOthers) {
    if (hasRecents) {
      rows.push({ type: 'header', key: 'h-other', label: 'Other' })
    }
    for (let i = firstNonRecentIndex; i < items.length; i++) {
      rows.push({ type: 'item', key: items[i].id, item: items[i], itemIndex: i })
    }
  }
  return rows
}

export function PaletteList(props: PaletteListProps) {
  const { items, firstNonRecentIndex, selectedIndex, onSelectIndex, onInvoke } = props

  const rows = useMemo(
    () => buildRows(items, firstNonRecentIndex),
    [items, firstNonRecentIndex],
  )

  const selectedRowIndex = useMemo(() => {
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (r.type === 'item' && r.itemIndex === selectedIndex) return i
    }
    return -1
  }, [rows, selectedIndex])

  const isHeaderAt = (index: number): boolean => rows[index]?.type === 'header'

  const { parentRef, virtualItems, totalSize } = usePaletteListData({
    rowCount: rows.length,
    selectedRowIndex,
    isHeaderAt,
  })

  return (
    <div
      ref={parentRef}
      className="max-h-[55vh] min-h-[200px] overflow-y-auto"
    >
      <div
        className="relative w-full"
        style={{ height: `${totalSize}px` }}
      >
        {virtualItems.map((virtualRow) => {
          const row = rows[virtualRow.index]
          if (!row) return null
          if (row.type === 'header') {
            return (
              <div
                key={row.key}
                className="absolute left-0 top-0 flex w-full items-center px-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.label}
              </div>
            )
          }
          const itemIndex = row.itemIndex
          return (
            <div
              key={row.key}
              className="absolute left-0 top-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <PaletteItemRow
                item={row.item}
                isSelected={itemIndex === selectedIndex}
                onHover={() => onSelectIndex(itemIndex)}
                onSelect={() => onInvoke(row.item)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
